import {Button, Form, Input} from 'antd';
import React from "react";

export default function LoginComponent(props) {
    const layout = {
        labelCol: {span: 8},
        wrapperCol: {span: 16},
    };
    const tailLayout = {
        wrapperCol: {offset: 8, span: 16},
    };

    const onFinish = values => {
        props.joinGame(values);
    }

    const createGame = () => {
        // TODO: figure out a way to make this work with UUID so it is like actually random
        const room = Math.random().toString(36).substr(2, 4).toUpperCase();
        props.createGame(room);
    }

    return (
        <div>
            <h1>Aroon Trivia</h1>
            <Form {...layout} onFinish={onFinish}>
                <Form.Item name="room" label="Room Code" rules={[{required: true}]}>
                    <Input size="large"/>
                </Form.Item>
                <Form.Item name="name" label="Your Name" rules={[{required: true}]}>
                    <Input size="large"/>
                </Form.Item>
                <Form.Item {...tailLayout}>
                    <Button type="primary" size="large" htmlType="submit">Join Game</Button>
                </Form.Item>
                <Form.Item {...tailLayout}>
                    <Button size="large" onClick={createGame}>Create Game</Button>
                </Form.Item>
            </Form>
        </div>
    )
}