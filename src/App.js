import React from 'react';
import logo from './logo.svg';
import './App.css';
import LoginComponent from "./LoginComponent";
import GameComponent from "./GameComponent";
import AdminComponent from "./AdminComponent";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {room: '', name: '', page: 'login'}
        this.loadGame = this.loadGame.bind(this);
        this.loadAdmin = this.loadAdmin.bind(this);
        this.loadLogin = this.loadLogin.bind(this);
    }

    loadGame(loginValues) {
        this.setState({
            room: loginValues.room,
            name: loginValues.name,
            page: 'game'
        });
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

    render() {
        switch (this.state.page) {
            case "admin":
                return <AdminComponent room={this.state.room} goBack={this.loadLogin}/>
            case "game":
                return <GameComponent room={this.state.room} name={this.state.name} goBack={this.loadLogin}/>
            default:
                return <LoginComponent joinGame={this.loadGame} createGame={this.loadAdmin}/>
        }
    }
}

export default App;
