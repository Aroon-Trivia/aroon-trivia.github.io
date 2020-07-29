import React from "react";
import {Button, Form, Input, InputNumber, PageHeader} from "antd";
import socketIOClient from 'socket.io-client';
import {socketURL} from "./Constants";

export default class GameComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state  = {question: 'Waiting for a question...', acceptAnswers: true}
        this.submitAnswer = this.submitAnswer.bind(this);
        this.answerForm = this.answerForm.bind(this);
    }

    componentDidMount() {
        const socket = socketIOClient(socketURL);
        socket.on('question', data => {
           this.setState({
              question: data.question,
              acceptAnswers: true
           });
        });
    }

    async submitAnswer() {
        try {
            const response = await fetch();
            if (response.status !== 200) {
                alert(`Unable to submit answer. Error message: ${response.status} Response`);
            } else {
                this.setState({
                   question: 'Answer received! Waiting for another question...',
                   acceptAnswers: false
                });
            }
        } catch (e) {
            alert(`Unable to submit answer. Error message: ${e}`)
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
            <Form.Item name="points" label="Points" rules={[{required: true}]}>
                <InputNumber size="large"/>
            </Form.Item>
            <Form.Item {...tailLayout}>
                <Button type="primary" size="large" htmlType="submit">Submit Answer</Button>
            </Form.Item>
        </Form>
    }

    render() {


        return (<div>
                <PageHeader title={`Game ${this.props.room}`} onBack={this.props.goBack}/>
                <h3>Question</h3>
                <p>{this.state.question}</p>
                {this.state.acceptAnswers ? this.answerForm() : null}
            </div>
        );
    }
}