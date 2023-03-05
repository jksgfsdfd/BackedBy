"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const keccak_1 = require("ethereum-cryptography/keccak");
const utils_1 = require("ethereum-cryptography/utils");
const functionalities_1 = require("../functionalities");
const MerkleTree_1 = __importDefault(require("../utils/MerkleTree"));
describe("verification", function () {
    it("throw error when the to field is ommited", function () {
        const messageObject = {
            name: "maanas",
            rating: 10
        };
        (0, chai_1.expect)(() => (0, functionalities_1.getFinalHash)(messageObject)).to.throw();
    });
    it("throw error when the invalid hide field is passed", function () {
        const messageObject = {
            to: "0x1234123",
            name: "maanas",
            rating: 10
        };
        (0, chai_1.expect)(() => (0, functionalities_1.getFinalHash)(messageObject, ["rank"])).to.throw();
    });
    it("calculates the hash correctly with 0 hideFields", function () {
        const messageObject = {
            to: "0x1234123",
            name: "maanas",
            rating: 10
        };
        const keys = Object.keys(messageObject);
        keys.sort();
        const finalObj = {};
        for (let i = 0; i < keys.length; i++) {
            finalObj[keys[i]] = messageObject[keys[i]];
        }
        const expectedHash = (0, utils_1.toHex)((0, keccak_1.keccak256)((0, utils_1.utf8ToBytes)(JSON.stringify(finalObj))));
        (0, chai_1.expect)((0, functionalities_1.getFinalHash)(messageObject)).to.equal(expectedHash);
    });
    it("calculates the hash correctly with 1 hideField", function () {
        const messageObject = {
            to: "0x1234123",
            name: "maanas",
            rating: 10
        };
        const keys = Object.keys(messageObject);
        keys.sort();
        const finalObj = {};
        for (let i = 0; i < keys.length; i++) {
            if (keys[i] == "name") {
                continue;
            }
            finalObj[keys[i]] = messageObject[keys[i]];
        }
        const hiddenHash = (0, utils_1.toHex)((0, keccak_1.keccak256)((0, utils_1.utf8ToBytes)(`name:${messageObject["name"]}`)));
        finalObj.hiddenHash = hiddenHash;
        console.log(finalObj);
        const expectedHash = (0, utils_1.toHex)((0, keccak_1.keccak256)((0, utils_1.utf8ToBytes)(JSON.stringify(finalObj))));
        (0, chai_1.expect)((0, functionalities_1.getFinalHash)(messageObject, ["name"])).to.equal(expectedHash);
    });
    it("calculates the hash correctly with multiple hideFields", function () {
        const messageObject = {
            to: "0x1234123",
            name: "maanas",
            rating: 10,
            age: 23
        };
        const keys = Object.keys(messageObject);
        keys.sort();
        const hideFields = ["name", "rating"];
        const hides = [];
        const finalObj = {};
        for (let i = 0; i < keys.length; i++) {
            if (hideFields.includes(keys[i])) {
                hides.push(`${keys[i]}:${messageObject[keys[i]]}`);
                continue;
            }
            finalObj[keys[i]] = messageObject[keys[i]];
        }
        const merkleTree = new MerkleTree_1.default(hides);
        const hiddenHash = merkleTree.getRoot();
        finalObj.hiddenHash = hiddenHash;
        console.log(finalObj);
        const expectedHash = (0, utils_1.toHex)((0, keccak_1.keccak256)((0, utils_1.utf8ToBytes)(JSON.stringify(finalObj))));
        (0, chai_1.expect)((0, functionalities_1.getFinalHash)(messageObject, ["name", "rating"])).to.equal(expectedHash);
    });
});
