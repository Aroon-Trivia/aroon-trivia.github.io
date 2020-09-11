import React from 'react';
import logo from './logo.svg';
import './App.css';
import LoginComponent from "./LoginComponent";
import GameComponent from "./GameComponent";
import AdminComponent from "./AdminComponent";
import * as cookie from "react-cookies";
import {tomorrow} from "./Utils";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {room: '', name: '', id: '', page: 'login'}
        this.loadGame = this.loadGame.bind(this);
        this.loadAdmin = this.loadAdmin.bind(this);
        this.loadLogin = this.loadLogin.bind(this);
        this.saveCookie = this.saveCookie.bind(this);
        this.checkForCookie = this.checkForCookie.bind(this);
        this.clearCookie = this.clearCookie.bind(this);
    }

    componentDidMount() {
        this.loadGame(this.checkForCookie());
    }

    saveCookie() {
        cookie.save('gamestate', {
            room: this.state.room,
            name: this.state.name,
            id: this.state.id
        }, {
            expires: tomorrow()
        });
    }

    checkForCookie() {
        return cookie.load('gamestate');
    }

    clearCookie() {
        cookie.remove('gamestate');
    }

    loadGame(loginValues) {
        this.setState({
            room: loginValues.room,
            name: loginValues.name,
            id: loginValues.id,
            page: 'game'
        });
        this.saveCookie();
    }

    loadAdmin(room) {
        this.setState({
            room: room,
            page: 'admin'
        });
    }

    loadLogin() {
        this.setState({
            page: 'login'
        });
    }

    backToLogin() {
        this.clearCookie();
        this.loadLogin();
    }

    render() {
        switch (this.state.page) {
            case "admin":
                return <AdminComponent room={this.state.room} goBack={this.backToLogin}/>
            case "game":
                return <GameComponent room={this.state.room} name={this.state.name} id={this.state.id}
                                      goBack={this.backToLogin}/>
            default:
                return <LoginComponent joinGame={this.loadGame} createGame={this.loadAdmin}/>
        }
    }
}

export default App;
