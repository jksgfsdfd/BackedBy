"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MerkleTree_instances, _MerkleTree_getRoot;
Object.defineProperty(exports, "__esModule", { value: true });
const keccak_1 = require("ethereum-cryptography/keccak");
const utils_1 = require("ethereum-cryptography/utils");
class MerkleTree {
    constructor(leaves) {
        _MerkleTree_instances.add(this);
        if (leaves) {
            this.leaves = leaves.map((message) => {
                return (0, utils_1.toHex)((0, keccak_1.keccak256)((0, utils_1.utf8ToBytes)(message)));
            });
        }
        else {
            this.leaves = [];
        }
    }
    addElement(message) {
        this.leaves.push((0, utils_1.toHex)((0, keccak_1.keccak256)((0, utils_1.utf8ToBytes)(message))));
    }
    getRoot() {
        return __classPrivateFieldGet(this, _MerkleTree_instances, "m", _MerkleTree_getRoot).call(this, this.leaves);
    }
    concat(left, right) {
        return (0, utils_1.toHex)((0, keccak_1.keccak256)((0, utils_1.utf8ToBytes)(left.concat(right))));
    }
    getProof(index, layer = this.leaves, proof = []) {
        if (layer.length === 1) {
            return proof;
        }
        const newLayer = [];
        for (let i = 0; i < layer.length; i += 2) {
            const left = layer[i];
            const right = layer[i + 1];
            if (!right) {
                newLayer.push(left);
            }
            else {
                newLayer.push(this.concat(left, right));
                if (i === index || i === index - 1) {
                    let isLeft = Boolean(index % 2);
                    proof.push({
                        data: isLeft ? left : right,
                        left: isLeft,
                    });
                }
            }
        }
        return this.getProof(Math.floor(index / 2), newLayer, proof);
    }
    getProofForMessage(message) {
        const hash = (0, utils_1.toHex)((0, keccak_1.keccak256)((0, utils_1.utf8ToBytes)(message)));
        const index = this.leaves.indexOf(hash);
        if (index == -1) {
            return false;
        }
        else {
            return this.getProof(index);
        }
    }
}
_MerkleTree_instances = new WeakSet(), _MerkleTree_getRoot = function _MerkleTree_getRoot(leaves) {
    if (leaves.length === 1) {
        return leaves[0];
    }
    const layer = [];
    for (let i = 0; i < leaves.length; i += 2) {
        const left = leaves[i];
        const right = leaves[i + 1];
        if (right) {
            layer.push(this.concat(left, right));
        }
        else {
            layer.push(left);
        }
    }
    return __classPrivateFieldGet(this, _MerkleTree_instances, "m", _MerkleTree_getRoot).call(this, layer);
};
exports.default = MerkleTree;
