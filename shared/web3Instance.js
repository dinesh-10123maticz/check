const Web3 = require('web3');

// import Config from '../config/config';

const rpc_wss = 'wss://sepolia.infura.io/ws/v3/6bcc2d2f4a6e45de849563164d80ca26';
const rpc_http = 'https://ethereum-sepolia-rpc.publicnode.com';//'https://sepolia.infura.io/v3/6bcc2d2f4a6e45de849563164d80ca26';

// const rpc_http =  'https://polygon-mainnet.infura.io/v3/6bcc2d2f4a6e45de849563164d80ca26';
// const rpc_wss = 'wss://polygon-mainnet.infura.io/ws/v3/6bcc2d2f4a6e45de849563164d80ca26';

class Web3Singleton {
    constructor() {
        if (!Web3Singleton.instance) {
            this.initialize();
            Web3Singleton.instance = this;
        }
        return Web3Singleton.instance;
    }

    initialize() {
        // HTTP Singleton
        this.web3Instance = new Web3(
            new Web3.providers.HttpProvider(rpc_http, {
                keepAlive: true,
                timeout: 30000,
            }),
        );

        // WebSocket Singleton (with auto reconnect)
        this.web3WsInstance = new Web3(
            new Web3.providers.WebsocketProvider(rpc_wss, {
                reconnect: {
                    auto: true,
                    delay: 5000,
                    maxAttempts: 10,
                    onTimeout: false,
                },
            }),
        );
    }
}

const instance = new Web3Singleton();

export default instance;
