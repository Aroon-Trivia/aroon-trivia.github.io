import { Button, Form, Input } from 'antd';
import React from "react";
import { joinURL } from './Constants';
import uuid from "react-uuid";

export default class LoginComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {waiting: false}
        this.joinGame = this.joinGame.bind(this);
        this.createGame = this.createGame.bind(this);
    }

    async joinGame(values) {
        try {
            this.setState({
                waiting: true
            });
            values.room = values.room.trim().toUpperCase();
            values.name = values.name.trim();
            values.id = uuid();
            const response = await fetch(joinURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(values)
            });
            if (response.status !== 200) {
                alert(`Unable to join game. Error message: ${response.status} Response`);
            } else {
                this.props.joinGame(values);
            }
        } catch (e) {
            alert(`Unable to join game. Error message: ${e}`)
        } finally {
            this.setState({
                waiting: false
            });
        }
    }

    createGame() {
        // TODO: figure out a way to make this work with UUID so it is like actually random
        const room = Math.random().toString(36).substr(2, 4).toUpperCase();
        this.props.createGame(room);
    }

    render() {
        const layout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        };
        const tailLayout = {
            wrapperCol: {offset: 8, span: 16},
        };

        return (
            <div>
                <h1>Aroon Trivia</h1>
                <Form {...layout} onFinish={this.joinGame}>
                    <Form.Item name="room" label="Room Code" rules={[{required: true}]}>
                        <Input size="large"/>
                    </Form.Item>
                    <Form.Item name="name" label="Your Name" rules={[{required: true}]}>
                        <Input size="large"/>
                    </Form.Item>
                    <Form.Item {...tailLayout}>
                        {this.state.wait ? <i>Joining room...</i> :
                            <Button type="primary" size="large" htmlType="submit">Join Game</Button>}
                    </Form.Item>
                    <Form.Item {...tailLayout}>
                        <Button size="large" onClick={this.createGame}>Create Game</Button>
                    </Form.Item>
                </Form>
            </div>
        )
    }
}