"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const engine_1 = require("@remixproject/engine");
const web3_1 = __importDefault(require("web3"));
const profile = {
    name: "udapp",
    displayName: "udapp",
    description: "",
    icon: "assets/img/fileManager.webp",
    version: "0.0.1",
    methods: [
        "deploy",
        "send",
        "addNetwork",
        "getAccounts",
        "setAccount",
        "disconnect",
    ],
    events: ["receipt", "deploy"],
    kind: "file-system",
};
class DeployModule extends engine_1.Plugin {
    constructor() {
        super(profile);
        this.accounts = [];
        this.compiledContracts = {};
    }
    setListeners() {
        return __awaiter(this, void 0, void 0, function* () {
            // listen for plugins
            this.on("manager", "pluginActivated", yield this.addPluginProvider.bind(this));
            this.on("manager", "pluginDeactivated", yield this.removePluginProvider.bind(this));
            this.on("solidity", "compilationFinished", (file, source, languageVersion, data) => {
                this.compiledContracts = data.contracts[file];
            });
        });
    }
    addNetwork(network) {
        return __awaiter(this, void 0, void 0, function* () {
            this.print(`Adding network ${network}`);
            let networkprovider = new web3_1.default.providers.HttpProvider(network);
            this.call("web3Provider", "setProvider", networkprovider);
        });
    }
    setAccount(account) {
        return __awaiter(this, void 0, void 0, function* () {
            this.web3.eth.defaultAccount = account;
            this.print(`Account changed to ${this.web3.eth.defaultAccount}`);
        });
    }
    getAccounts(setAccount = true) {
        return __awaiter(this, void 0, void 0, function* () {
            let provider = yield this.call("web3Provider", "getProvider");
            this.print("Get accounts...");
            console.log("GET ACCOUNTS UDAPP", provider);
            if (!provider)
                return [];
            try {
                if (yield this.web3.eth.net.isListening()) {
                    let accounts = yield this.web3.eth.getAccounts();
                    if (setAccount) {
                        if (accounts.length > 0)
                            this.web3.eth.defaultAccount = accounts[0];
                        this.print(`Account changed to ${this.web3.eth.defaultAccount}`);
                    }
                    return accounts;
                }
            }
            catch (e) {
                this.print(`Can't get accounts...`);
                console.log(e);
            }
            return [];
        });
    }
    // web3
    addPluginProvider(profile) {
        return __awaiter(this, void 0, void 0, function* () {
            if (profile.kind === "provider") {
                ((profile, app) => {
                    let web3Provider = {
                        sendAsync(payload, callback) {
                            return __awaiter(this, void 0, void 0, function* () {
                                try {
                                    const result = yield app.call(profile.name, "sendAsync", payload);
                                    callback(null, result);
                                }
                                catch (e) {
                                    callback(e);
                                }
                            });
                        },
                    };
                    this.call("web3Provider", "setProvider", web3Provider);
                    this.web3Provider = {
                        sendAsync(payload, callback) {
                            return __awaiter(this, void 0, void 0, function* () {
                                try {
                                    const result = yield app.call("web3Provider", "sendAsync", payload);
                                    callback(null, result);
                                }
                                catch (e) {
                                    callback(e);
                                }
                            });
                        },
                    };
                    this.web3 = new web3_1.default(this.web3Provider);
                    //app.blockchain.addProvider({ name: profile.displayName, provider: web3Provider })
                })(profile, this);
            }
        });
    }
    removePluginProvider(profile) {
        return __awaiter(this, void 0, void 0, function* () {
            if (profile.kind === "provider")
                this.web3Provider = null;
        });
    }
    print(m) {
        this.call("terminal", "log", m);
    }
    showContractPicker() {
        return __awaiter(this, void 0, void 0, function* () {
            const keys = Object.keys(this.compiledContracts);
        });
    }
    detectNetwork() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.web3.eth.net.getId((err, id) => {
                this.networkName = null;
                if (err) {
                    this.print(`Could not detect network! Please connnect to your wallet.`);
                    return;
                }
                // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
                else if (id === 1)
                    this.networkName = "Main";
                else if (id === 2)
                    this.networkName = "Morden (deprecated)";
                else if (id === 3)
                    this.networkName = "Ropsten";
                else if (id === 4)
                    this.networkName = "Rinkeby";
                else if (id === 5)
                    this.networkName = "Goerli";
                else if (id === 42)
                    this.networkName = "Kovan";
                else
                    this.networkName = "Custom";
                this.print(`Network is ${this.networkName}!`);
            });
        });
    }
    txDetailsLink(hash) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.detectNetwork();
            const transactionDetailsLinks = {
                Main: "https://www.etherscan.io/address/",
                Rinkeby: "https://rinkeby.etherscan.io/address/",
                Ropsten: "https://ropsten.etherscan.io/address/",
                Kovan: "https://kovan.etherscan.io/address/",
                Goerli: "https://goerli.etherscan.io/address/",
            };
            if (transactionDetailsLinks[this.networkName]) {
                return transactionDetailsLinks[this.networkName] + hash;
            }
        });
    }
    getContract(contractName) {
        return __awaiter(this, void 0, void 0, function* () {
            const selectedContractKey = Object.keys(this.compiledContracts).find((name) => name == contractName);
            const c = this.compiledContracts[selectedContractKey];
            console.log(c);
            return c;
        });
    }
    deploy(contractName, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const c = yield this.getContract(contractName);
            if (!c) {
                this.print("No contract specified.");
                return;
            }
            this.print(`Deploying contract ${contractName} started!`);
            //this.print(`Deploying  ${Object.keys(c)} ...`);
            try {
                if (!this.web3Provider) {
                    this.print("No Web3 provider activated! Please activate a wallet or web3 provider plugin.");
                    return;
                }
                yield this.detectNetwork();
                let contract = new this.web3.eth.Contract(c.abi);
                let deployObject = contract.deploy({
                    data: c.evm.bytecode.object,
                    arguments: payload,
                });
                let gasValue = yield deployObject.estimateGas();
                const gasBase = Math.ceil(gasValue * 1.2);
                const gas = gasBase;
                this.print(`Gas estimate ${gas}`);
                let me = this;
                yield deployObject
                    .send({
                    from: this.web3.eth.defaultAccount,
                    gas: gas,
                })
                    .on("receipt", function (receipt) {
                    return __awaiter(this, void 0, void 0, function* () {
                        me.emit("deploy", {
                            receipt: receipt,
                            abi: c.abi,
                            contractName: contractName,
                        });
                        me.print(`Contract deployed at ${receipt.contractAddress}`);
                        const link = yield me.txDetailsLink(receipt.contractAddress);
                        me.print(link);
                    });
                });
                this.print("Deploying ...");
            }
            catch (e) {
                console.log("ERROR ", e);
                this.print(`There are errors deploying: ${e}`);
                throw new Error(`There are errors deploying: ${e}`);
            }
        });
    }
    send(abi, payload, address, value, unit, gaslimit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.web3Provider) {
                    this.print("No Web3 provider activated! Please activate a wallet or web3 provider plugin.");
                    return;
                }
                yield this.detectNetwork();
                let contract = new this.web3.eth.Contract(JSON.parse(JSON.stringify([abi])), address);
                let accounts = yield this.web3.eth.getAccounts();
                if (abi.stateMutability === "view" || abi.stateMutability === "pure") {
                    try {
                        this.print(`Calling method '${abi.name}' with ${JSON.stringify(payload)} from ${this.web3.eth.defaultAccount} at contract address ${address}`);
                        const txReceipt = abi.name
                            ? yield contract.methods[abi.name](...payload).call({
                                from: this.web3.eth.defaultAccount,
                                gas: gaslimit,
                            })
                            : null;
                        this.print(JSON.stringify(txReceipt));
                        return txReceipt;
                        // TODO: LOG
                    }
                    catch (e) {
                        console.error(e);
                        throw new Error(`There are errors calling: ${e}`);
                    }
                }
                else {
                    try {
                        this.print(`Send data to method '${abi.name}' with ${JSON.stringify(payload)} from ${this.web3.eth.defaultAccount} at contract address ${address}`);
                        console.log({
                            from: this.web3.eth.defaultAccount,
                            gas: gaslimit,
                            value: this.web3.utils.toWei(value, unit),
                        });
                        yield contract.methods[abi.name](...payload);
                        const txReceipt = abi.name
                            ? yield contract.methods[abi.name](...payload).send({
                                from: this.web3.eth.defaultAccount,
                                gas: gaslimit,
                                value: this.web3.utils.toWei(value, unit),
                            })
                            : null;
                        this.print(JSON.stringify(txReceipt));
                        return txReceipt;
                        // TODO: LOG
                    }
                    catch (e) {
                        console.error(e);
                        throw new Error(`There are errors sending data: ${e}`);
                    }
                }
            }
            catch (e) {
                console.log("ERROR ", e);
                this.print(`There are errors sending data.`);
                throw new Error(`There are errors sending data: ${e}`);
            }
        });
    }
}
exports.default = DeployModule;
//# sourceMappingURL=udapp.js.map