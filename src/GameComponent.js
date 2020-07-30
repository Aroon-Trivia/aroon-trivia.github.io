import React from "react";
import { Button, Form, Input, InputNumber, PageHeader } from "antd";
import socketIOClient from 'socket.io-client';
import { answerURL, readableConnectionStatus, socketURL } from "./Constants";

export default class GameComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {question: 'Waiting for a question...', questionStyle: '', acceptAnswers: false, waiting: false, connected: false}
        this.submitAnswer = this.submitAnswer.bind(this);
        this.answerForm = this.answerForm.bind(this);
    }

    componentDidMount() {
        const socket = socketIOClient(socketURL, {
            path: '/register', query: {
                room: this.props.room,
                name: this.props.name
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
        socket.on('question', data => {
            console.log(data);
            this.setState({
                question: data.question,
                questionStyle: data.questionStyle,
                acceptAnswers: true
            });
        });
    }

    async submitAnswer(values) {
        try {
            this.setState({
                waiting: true
            });
            const response = await fetch(answerURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    answer: values.answer,
                    points: values.points,
                    room: this.props.room,
                    player: this.props.name
                })
            });
            if (response.status !== 200) {
                alert(`Unable to submit answer. Error message: ${response.status} Response`);
            } else {
                this.setState({
                    question: 'Answer received! Waiting for another question...',
                    acceptAnswers: false,
                });
            }
        } catch (e) {
            alert(`Unable to submit answer. Error message: ${e}`)
        } finally {
            this.setState({
                waiting: false
            });
        }
    }

    answerForm() {
        const layout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        };
        const tailLayout = {
            wrapperCol: {offset: 8, span: 16},
        };

        return <Form {...layout} onFinish={this.submitAnswer}>
            <Form.Item name="answer" label="Answer" rules={[{required: true}]}>
                <Input size="large"/>
            </Form.Item>
            {this.state.questionStyle !== 'custom' && this.state.questionStyle !== 'pointPer' ?
                <Form.Item name="points" label="Points" rules={[{required: true}]}>
                    <InputNumber size="large"/>
                </Form.Item> : null}
            <Form.Item {...tailLayout}>
                {this.state.waiting ? <div>Submitting answer...</div> :
                    <Button type="primary" size="large" htmlType="submit">Submit Answer</Button>}
            </Form.Item>
        </Form>
    }

    render() {


        return (<div>
                <PageHeader title={`Game ${this.props.room}`} onBack={this.props.goBack} subTitle={readableConnectionStatus(this.state.connected)}/>
                <h3>Question</h3>
                <p>{this.state.question}</p>
                {this.state.acceptAnswers ? this.answerForm() : null}
            </div>
        );
    }
}