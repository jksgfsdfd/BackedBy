"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const keccak_1 = require("ethereum-cryptography/keccak");
const utils_1 = require("ethereum-cryptography/utils");
class MerkleTree {
    constructor(leaves) {
        this.leaves = leaves.map(Buffer.from).map(keccak_1.keccak256);
    }
    getRoot() {
        return (0, utils_1.bytesToHex)(this._getRoot(this.leaves));
    }
    concat(left, right) {
        return (0, keccak_1.keccak256)(Buffer.concat([left, right]));
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
                    let isLeft = !(index % 2);
                    proof.push({
                        data: isLeft ? (0, utils_1.bytesToHex)(right) : (0, utils_1.bytesToHex)(left),
                        left: !isLeft,
                    });
                }
            }
        }
        return this.getProof(Math.floor(index / 2), newLayer, proof);
    }
    // private function
    _getRoot(leaves = this.leaves) {
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
        return this._getRoot(layer);
    }
}
module.exports = MerkleTree;
