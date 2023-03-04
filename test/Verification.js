"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const keccak_1 = require("ethereum-cryptography/keccak");
const utils_1 = require("ethereum-cryptography/utils");
const functionalities_1 = require("../functionalities");
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
    it("calculates the hash correctly with hideFields", function () {
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
        const hiddenHash = (0, utils_1.toHex)((0, keccak_1.keccak256)((0, utils_1.utf8ToBytes)(messageObject.name)));
        const hashingObject = {
            to: "0x1234123",
            rating: 10,
            hiddenHash: hiddenHash
        };
        const expectedHash = (0, utils_1.toHex)((0, keccak_1.keccak256)((0, utils_1.utf8ToBytes)(JSON.stringify(hashingObject))));
        (0, chai_1.expect)((0, functionalities_1.getFinalHash)(messageObject, ["name"])).to.not.equal(expectedHash);
    });
});
