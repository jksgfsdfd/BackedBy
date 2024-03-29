"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.sign = exports.verify = exports.getFinalHash = exports.generateProof = void 0;
const keccak_1 = require("ethereum-cryptography/keccak");
const secp256k1 = __importStar(require("ethereum-cryptography/secp256k1"));
const utils_1 = require("ethereum-cryptography/utils");
const MerkleTree_1 = __importDefault(require("./utils/MerkleTree"));
/*
    signature format:
    to: address
    field : value
    we must be able to showcase only parts. therefore the final signature will be the merkled hash
*/
function generateProof(message, hideFields, hideField) {
    if (!message.to) {
        throw new Error("A to field is neccessary");
    }
    hideFields.forEach((field) => {
        if (!message[field]) {
            throw Error("invalid hide field");
        }
        if (field == "to") {
            throw Error("The to field cannot be hidden");
        }
    });
    let finalObj = {};
    const fields = Object.keys(message);
    fields.sort();
    const hides = [];
    fields.forEach((field) => {
        if (hideFields === null || hideFields === void 0 ? void 0 : hideFields.includes(field)) {
            hides.push(`${field}:${message[field]}`);
        }
        else {
            finalObj[field] = message[field];
        }
    });
    if (!hideFields.includes(hideField)) {
        throw new Error("Field is not hidden");
    }
    const merkleTree = new MerkleTree_1.default(hides);
    const proof = merkleTree.getProofForMessage(`${hideField}:${message[hideField]}`);
    return proof;
}
exports.generateProof = generateProof;
function getFinalHash(message, hideFields) {
    if (!message.to) {
        throw new Error("A to field is neccessary");
    }
    hideFields === null || hideFields === void 0 ? void 0 : hideFields.forEach((field) => {
        if (!message[field]) {
            throw Error("invalid hide field");
        }
        if (field == "to") {
            throw Error("The to field cannot be hidden");
        }
    });
    let finalObj = {};
    const fields = Object.keys(message);
    fields.sort();
    const hides = [];
    fields.forEach((field) => {
        if (hideFields === null || hideFields === void 0 ? void 0 : hideFields.includes(field)) {
            hides.push(`${field}:${message[field]}`);
        }
        else {
            finalObj[field] = message[field];
        }
    });
    if (hides.length) {
        const merkleTree = new MerkleTree_1.default(hides);
        const merkleRoot = merkleTree.getRoot();
        finalObj.hiddenHash = merkleRoot;
    }
    console.log(finalObj);
    return (0, utils_1.toHex)((0, keccak_1.keccak256)((0, utils_1.utf8ToBytes)(JSON.stringify(finalObj))));
}
exports.getFinalHash = getFinalHash;
function verify(storedHash, givenString, hiddenElement, hiddenProof) {
    if (!hiddenProof) {
        if ((0, utils_1.toHex)((0, keccak_1.keccak256)((0, utils_1.utf8ToBytes)(givenString))) == storedHash) {
            return true;
        }
        else {
            return false;
        }
    }
    if (!hiddenElement) {
        throw Error("Provide hidden element for verification");
    }
    const hiddenHash = JSON.parse(storedHash).hiddenHash;
    let tempHash = (0, utils_1.toHex)((0, keccak_1.keccak256)((0, utils_1.utf8ToBytes)(hiddenElement)));
    for (let i = 0; i < hiddenProof.length; i++) {
        const currentProofElle = hiddenProof[i];
        tempHash = (0, utils_1.toHex)((0, keccak_1.keccak256)((0, utils_1.utf8ToBytes)(currentProofElle.left ? currentProofElle.data.concat(tempHash) : tempHash.concat(currentProofElle.data))));
    }
    if (hiddenHash == tempHash) {
        return true;
    }
    else {
        return false;
    }
}
exports.verify = verify;
function sign(finalHash, privateKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const [signature, recovery] = yield secp256k1.sign(finalHash, privateKey, {
            recovered: true
        });
        return (0, utils_1.toHex)(signature);
    });
}
exports.sign = sign;
