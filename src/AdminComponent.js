import React from "react";
import { Button, Card, Form, Input, PageHeader, Select } from "antd";
import socketIOClient from 'socket.io-client';
import { questionStyleReadable, questionURL, socketURL } from './Constants';
import { Option } from 'antd/lib/mentions';

export default class AdminComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {players: [], answers: [], question: '', questionStyle: '', waiting: false}
        this.mapPlayersToList = this.mapPlayersToList.bind(this);
        this.mapAnswersToList = this.mapAnswersToList.bind(this);
        this.adjustScore = this.adjustScore.bind(this);
        this.adjustPoints = this.adjustPoints.bind(this);
        this.submitQuestion = this.submitQuestion.bind(this);
        this.pointAdjusters = this.pointAdjusters.bind(this);
        this.applyPoints = this.applyPoints.bind(this);
        this.questionForm = this.questionForm.bind(this);
    }

    // TODO: stop hacking around the duplicate state calls and fix it; see the increment function
    componentDidMount() {
        const socket = socketIOClient(socketURL, {
            path: '/register', query: {
                room: this.props.room + '-admin'
            }, transports: ['websocket']
        });
        socket.on('submission', data => {
            this.setState(oldState => {
                if (!(oldState.answers.find(answer => answer.player === data.player) > -1)) {
                    if (this.state.questionStyle === 'custom') {
                        data.points = 0;
                    }
                    if (this.state.questionStyle === 'pointPer') {
                        data.points = 1;
                    }
                    return {
                        answers: [data, ...oldState.answers]
                    }
                }
            });
        });
        socket.on('join', playerName => {
            this.setState(oldState => {
                if (!(oldState.players.find(player => player.name === playerName) > -1)) {
                    const player = {
                        name: playerName,
                        score: 0
                    };
                    return {
                        players: [player, ...oldState.players]
                    }
                }
            });
        });
    }

    adjustScore(playerName, value) {
        this.setState(oldState => {
            const playerIndex = oldState.players.findIndex(player => player.name === playerName);
            const players = JSON.parse(JSON.stringify(oldState.players));
            players[playerIndex].score = players[playerIndex].score + value;
            return {
                players: players
            };
        });
    }

    mapPlayersToList(players) {
        return players.sort((a, b) => a.score > b.score).map(player => {
            return <li className="list" key={player.name}>
                <strong>{player.name}</strong><span className="bump-left">{player.score}</span>
                <Button size="small" className="big-bump-left"
                        onClick={() => this.adjustScore(player.name, -1)}>-</Button>
                <Button size="small" onClick={() => this.adjustScore(player.name, 1)}>+</Button>
            </li>
        });
    }

    mapAnswersToList(answers) {
        return answers.map(answer => {
            return <li className="list" key={answer.player}>
                <h4>{answer.player}</h4>
                <i>{answer.answer}</i>
                {this.state.questionStyle !== 'pointPer' ?
                    <strong className="bump-left">{answer.points}</strong> : null}
                {this.state.questionStyle === 'custom' ? this.pointAdjusters(answer) : null}
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

    adjustPoints(playerName, value) {
        this.setState(oldState => {
            const answerIndex = oldState.answers.findIndex(answer => answer.player === playerName);
            const answers = JSON.parse(JSON.stringify(oldState.answers));
            answers[answerIndex].points = answers[answerIndex].points + value;
            return {
                answers: answers
            };
        });
    }

    applyPoints() {

    }

    async submitQuestion(values) {
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
                this.setState({
                    question: values.question,
                    questionStyle: values.questionStyle,
                    answers: []
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
            </Form.Item>
        </Form>
    }

    render() {
        return <div>
            <PageHeader title={`Game ${this.props.room}`} onBack={this.props.goBack}/>
            <Card title={`Players - ${this.state.players.length}`}>
                <ul>
                    {this.mapPlayersToList(this.state.players)}
                </ul>
            </Card>
            <Card title={`Answers - ${this.state.answers.length}/${this.state.players.length}`}
                  extra={`Style: ${questionStyleReadable(this.state.questionStyle)}`}>
                <ul>
                    {this.mapAnswersToList(this.state.answers)}
                </ul>
                {this.state.answers.length > 0 ? <Button size="large" type="primary">Apply Points</Button> : null}
            </Card>
            <Card title="Question">
                {this.questionForm()}
            </Card>
        </div>;
    }
}