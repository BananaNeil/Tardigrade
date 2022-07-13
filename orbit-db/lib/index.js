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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var IPFS = require('ipfs');
var OrbitDB = require('orbit-db');
var ethers = require('ethers').ethers;
var fs = require('fs');
var Static = require('./static/Static.json');
//class OrbitalMeshnet
//class Tardigrade extends OrbitalMeshnet ? 
var Tardigrade = /** @class */ (function () {
    function Tardigrade(name, provider, diamondAddress, initialTipChains) {
        var _this = this;
        this.types = {
            EIP712Domain: [
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' },
                { name: 'chainId', type: 'uint256' },
                { name: 'verifyingContract', type: 'address' },
            ],
            TipChain: [
                { name: 'claimerNftId', type: 'uint256' },
                { name: 'deadline', type: 'uint256' },
                { name: 'tips', type: 'Tip[]' },
                { name: 'tipSigs', type: 'bytes[]' },
            ],
            Tip: [
                { name: 'senderNftId', type: 'uint256' },
                { name: 'amount', type: 'uint256' },
                { name: 'senderNonce', type: 'uint256' }
            ]
        };
        this.ethersTipType = {
            Tip: [
                { name: 'senderNftId', type: 'uint256' },
                { name: 'amount', type: 'uint256' },
                { name: 'senderNonce', type: 'uint256' }
            ]
        };
        this.ethersTipchainType = {
            TipChain: [
                { name: 'claimerNftId', type: 'uint256' },
                { name: 'deadline', type: 'uint256' },
                { name: 'tips', type: 'Tip[]' },
                { name: 'tipSigs', type: 'bytes[]' },
            ],
            Tip: [
                { name: 'senderNftId', type: 'uint256' },
                { name: 'amount', type: 'uint256' },
                { name: 'senderNonce', type: 'uint256' }
            ]
        };
        return (function () { return __awaiter(_this, void 0, void 0, function () {
            var ipfsOptions, _a, _b, _c;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        this.name = name;
                        this.diamondAddress = diamondAddress;
                        this.tipChains = initialTipChains ? initialTipChains : [{}];
                        ipfsOptions = {
                            repo: './ipfs',
                            EXPERIMENTAL: {
                                pubsub: true
                            }
                        };
                        _a = this;
                        return [4 /*yield*/, IPFS.create(ipfsOptions)];
                    case 1:
                        _a.ipfs = _e.sent();
                        _b = this;
                        return [4 /*yield*/, OrbitDB.createInstance(this.ipfs)];
                    case 2:
                        _b.orbitdb = _e.sent();
                        this.provider = provider;
                        this.signer = this.provider.getSigner();
                        this.receiverPaysFacet = ethers.Contract(diamondAddress, Static.receiverPaysFacet.abi, this.signer);
                        this.usernameFacet = ethers.Contract(diamondAddress, Static.usernameFacet.abi, this.signer);
                        _c = this;
                        _d = {};
                        return [4 /*yield*/, this.provider.getNetwork()];
                    case 3:
                        _c.domain = (_d.chainId = (_e.sent()).chainId,
                            _d.name = name,
                            _d.verifyingContract = diamondAddress,
                            _d.version = '1',
                            _d);
                        return [2 /*return*/];
                }
            });
        }); }).call(this);
    }
    ;
    Tardigrade.prototype.createTipChain = function (claimerNftId, post) {
        return __awaiter(this, void 0, void 0, function () {
            var url, db, deadline;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "".concat(this.name, ".").concat(claimerNftId, ".").concat(post);
                        return [4 /*yield*/, this.orbitdb.eventlog(url)];
                    case 1:
                        db = _a.sent();
                        deadline = Math.floor(new Date().getTime() / 1000) // create a getter from smartcontract 4 this
                        ;
                        return [4 /*yield*/, db.add({
                                claimerNftId: claimerNftId,
                                deadline: deadline
                            })];
                    case 2:
                        _a.sent();
                        this.tipChains.push({ url: url, db: db });
                        return [2 /*return*/];
                }
            });
        });
    };
    Tardigrade.prototype.loadTipChainByIPFSAddress = function (tipChainIPFSAddress) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    ;
    Tardigrade.prototype.loadTipChainByUrl = function (url) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    ;
    Tardigrade.prototype.appendTipChain = function (url, senderNftId, nonce, amount) {
        return __awaiter(this, void 0, void 0, function () {
            var db, tip, tipSig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.orbitdb.open(url)];
                    case 1:
                        db = _a.sent();
                        tip = {
                            senderNftId: senderNftId,
                            amount: amount,
                            senderNonce: nonce // probably can just fetch from chain
                        };
                        return [4 /*yield*/, this.signer._signTypedData(this.domain, this.ethersTipType, tip)];
                    case 2:
                        tipSig = _a.sent();
                        return [4 /*yield*/, db.add({
                                tip: tip,
                                tipSig: tipSig
                            })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ;
    Tardigrade.prototype.consumeTipChain = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    ;
    return Tardigrade;
}());
