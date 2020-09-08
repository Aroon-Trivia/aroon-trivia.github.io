import React from "react";
import { Button, Card, Checkbox, Form, Input, PageHeader, Popover, Select } from "antd";
import socketIOClient from 'socket.io-client';
import {
    customDesc,
    pointPerDesc,
    questionStyleReadable,
    questionURL, readableConnectionStatus,
    socketURL,
    wagerDesc,
    wagerLossDesc
} from './Constants';
import { Option } from 'antd/lib/mentions';

export default class AdminComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {players: [], answers: [], question: '', questionStyle: '', waiting: false, asked: 0, connected: false}
        this.mapPlayersToList = this.mapPlayersToList.bind(this);
        this.mapAnswersToList = this.mapAnswersToList.bind(this);
        this.adjustScore = this.adjustScore.bind(this);
        this.adjustPoints = this.adjustPoints.bind(this);
        this.submitQuestion = this.submitQuestion.bind(this);
        this.pointAdjusters = this.pointAdjusters.bind(this);
        this.applyPoints = this.applyPoints.bind(this);
        this.questionForm = this.questionForm.bind(this);
        this.toggleCorrect = this.toggleCorrect.bind(this);
        this.waitingText = this.waitingText.bind(this);
    }

    // TODO: stop hacking around the duplicate state calls and fix it; see the increment function
    componentDidMount() {
        const socket = socketIOClient(socketURL, {
            path: '/register', query: {
                room: this.props.room + '-admin'
            }, transports: ['websocket']
        });
        socket.on('connect', () => {
            this.setState({
                connected: true
            });
        });
        socket.on('disconnect', () => {
            this.setState({
                connected: false
            });
        });
        socket.on('submission', data => {
            this.setState(oldState => {
                if (!(oldState.answers.find(answer => answer.player.id === data.player.id) > -1)) {
                    if (this.state.questionStyle === 'custom') {
                        data.points = 0;
                        data.correct = true;
                    } else if (this.state.questionStyle === 'pointPer') {
                        data.points = 1;
                        data.correct = false;
                    } else {
                        data.correct = false;
                    }
                    return {
                        answers: [data, ...oldState.answers]
                    }
                }
            });
        });
        socket.on('join', newPlayer => {
            this.setState(oldState => {
                if (!(oldState.players.find(playerFromList => playerFromList.id === newPlayer.id) > -1)) {
                    const player = {
                        name: newPlayer.name,
                        id: newPlayer.id,
                        score: 0
                    };
                    return {
                        players: [player, ...oldState.players]
                    }
                }
            });
        });
    }

    adjustScore(player, value) {
        this.setState(oldState => {
            const playerIndex = oldState.players.findIndex(playerFromList => playerFromList.id === player.id);
            const players = JSON.parse(JSON.stringify(oldState.players));
            players[playerIndex].score += value;
            return {
                players: players
            };
        });
    }

    adjustPoints(player, value) {
        this.setState(oldState => {
            const answerIndex = oldState.answers.findIndex(answer => answer.player.id === player.id);
            const answers = JSON.parse(JSON.stringify(oldState.answers));
            answers[answerIndex].points += value;
            return {
                answers: answers
            };
        });
    }

    toggleCorrect(player) {
        this.setState(oldState => {
            const answerIndex = oldState.answers.findIndex(answer => answer.player.id === player.id);
            const answers = JSON.parse(JSON.stringify(oldState.answers));
            answers[answerIndex].correct = !answers[answerIndex].correct
            return {
                answers: answers
            };
        });
    }

    mapPlayersToList(players) {
        return players.sort((a, b) => a.score > b.score).map(player => {
            return <li className="list" key={player.name}>
                <strong>{player.name}</strong><span className="bump-left">{player.score}</span>
                <Button size="small" className="big-bump-left"
                        onClick={() => this.adjustScore(player, -1)}>-</Button>
                <Button size="small" onClick={() => this.adjustScore(player, 1)}>+</Button>
            </li>
        });
    }

    mapAnswersToList(answers) {
        return answers.map(answer => {
            return <li className="list" key={answer.player.id}>
                <h4>{answer.player.name}</h4>
                <i>{answer.answer}</i>
                {this.state.questionStyle !== 'pointPer' ?
                    <strong className="bump-left">{answer.points}</strong> : null}
                {this.state.questionStyle === 'custom' ? this.pointAdjusters(answer) : null}
                {this.state.questionStyle !== 'custom' ? <Checkbox className="big-bump-left" checked={answer.correct}
                                                                   onChange={() => this.toggleCorrect(answer.player)}>Correct</Checkbox> : null}
            </li>
        });
    }

    pointAdjusters(answer) {
        return (
            <div className="inline">
                <Button size="small" className="big-bump-left"
                        onClick={() => this.adjustPoints(answer.player, -1)}>-</Button>
                <Button size="small" onClick={() => this.adjustPoints(answer.player, 1)}>+</Button>
            </div>
        )
    }

    applyPoints() {
        debugger;
        this.state.answers.forEach(answer => {
            this.setState(oldState => {
                let players = JSON.parse(JSON.stringify(oldState.players));
                let playerIndex = players.findIndex(player => player.id === answer.player.id);
                if (answer.correct) {
                    if (oldState.questionStyle === 'pointPer') {
                        players[playerIndex].score += 1;
                    } else {
                        players[playerIndex].score += answer.points;
                    }
                    return {
                        players: players
                    }
                } else if (oldState.questionStyle === 'wagerLoss') {
                    players[playerIndex].score -= answer.points;
                    return {
                        players: players
                    }
                }
            });
        });
        this.setState({
            answers: [],
            question: '',
            questionStyle: ''
        });
    }

    async submitQuestion(values) {
        let allowNewQuestion = true;
        if (this.state.answers.length > 0) {
            allowNewQuestion = window.confirm('You haven\'t applied the points from the last question - are you sure you want to ask a new one?');
        }
        if (allowNewQuestion) {
            try {
                this.setState({
                    waiting: true
                });
                const response = await fetch(questionURL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        question: values.question,
                        questionStyle: values.questionStyle,
                        room: this.props.room
                    })
                });
                if (response.status !== 200) {
                    alert(`Unable to submit question. Error message: ${response.status} Response`);
                } else {
                    this.setState(oldState => {
                        return {
                            asked: oldState.asked + 1,
                            question: values.question,
                            questionStyle: values.questionStyle,
                            answers: []
                        }
                    });
                }
            } catch (e) {
                alert(`Unable to submit question. Error message: ${e}`)
            } finally {
                this.setState({
                    waiting: false
                });
            }
        }
    }

    questionStyles() {
        return (<ul>
            <li>
                <strong>Wager</strong><span className="bump-left">{wagerDesc}</span>
            </li>
            <li>
                <strong>Wager with Loss</strong><span className="bump-left">{wagerLossDesc}</span>
            </li>
            <li>
                <strong>Point-per-Question</strong><span className="bump-left">{pointPerDesc}</span>
            </li>
            <li>
                <strong>Gamemaster Chooses</strong><span className="bump-left">{customDesc}</span>
            </li>
        </ul>)
    }

    questionForm() {
        const layout = {
            labelCol: {span: 4},
            wrapperCol: {span: 20},
        };
        const tailLayout = {
            wrapperCol: {offset: 4, span: 20},
        };

        return <Form {...layout} onFinish={this.submitQuestion}>
            <Form.Item name="question" label="Question" rules={[{required: true}]}>
                <Input.TextArea/>
            </Form.Item>
            <Form.Item name="questionStyle" label="Question Style" rules={[{required: true}]}>
                <Select placeholder="Select a question style...">
                    <Option value="wager">Wager</Option>
                    <Option value="wagerLoss">Wager with Loss</Option>
                    <Option value="pointPer">Point-per-Question</Option>
                    <Option value="custom">Gamemaster Chooses</Option>
                </Select>
            </Form.Item>
            <Form.Item {...tailLayout}>
                {this.state.waiting ? <div>Submitting question...</div> :
                    <Button type="primary" size="large" htmlType="submit">Submit Question</Button>}
                <Popover title="Question Styles" content={this.questionStyles()} trigger="click">
                    <Button size="large" className="bump-left">Question Style Help</Button>
                </Popover>
            </Form.Item>
        </Form>
    }

    waitingText() {
        return this.state.question !== '' ? 'Waiting for answers...' : 'Ask a question!';
    }

    render() {
        return <div>
            <PageHeader title={`Game ${this.props.room}`} onBack={this.props.goBack} subTitle={readableConnectionStatus(this.state.connected)}/>
            <Card title={`Players`} extra={`${this.state.players.length}`}>
                <ul>
                    {this.mapPlayersToList(this.state.players)}
                </ul>
            </Card>
            <Card title={`Answers`}
                  extra={`${this.state.answers.length}/${this.state.players.length}`}>
                {this.state.question !== '' ?
                    <p><strong>{questionStyleReadable(this.state.questionStyle)}</strong> - {this.state.question}
                    </p> : null}
                <ul>
                    {this.mapAnswersToList(this.state.answers)}
                </ul>
                {this.state.answers.length > 0 ?
                    <Button size="large" type="primary" onClick={this.applyPoints}>Apply Points</Button> :
                    <i>{this.waitingText()}</i>}
            </Card>
            <Card title="Question" extra={`${this.state.asked} question${this.state.asked === 1 ? '' : 's'} asked`}>
                {this.questionForm()}
            </Card>
        </div>;
    }
}