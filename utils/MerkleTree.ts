import { keccak256 } from "ethereum-cryptography/keccak";
import { bytesToHex, toHex } from "ethereum-cryptography/utils";

class MerkleTree {
leaves:Uint8Array[];

  constructor(leaves:string[]) {
    this.leaves = leaves.map(Buffer.from).map(keccak256);
  }

  getRoot() {
    return bytesToHex(this._getRoot(this.leaves));
  }

  concat(left:Uint8Array,right:Uint8Array){
    return keccak256(Buffer.concat([left,right]))
  }

  getProof(index:number, layer = this.leaves, proof:any[] = []) : any {
    if (layer.length === 1) {
      return proof;
    }

    const newLayer = [];

    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i];
      const right = layer[i + 1];

      if (!right) {
        newLayer.push(left);
      } else {
        newLayer.push(this.concat(left, right));

        if (i === index || i === index - 1) {
          let isLeft = !(index % 2);
          proof.push({
            data: isLeft ? bytesToHex(right) : bytesToHex(left),
            left: !isLeft,
          });
        }
      }
    }

    return this.getProof(
      Math.floor(index / 2),
      newLayer,
      proof
    );
  }

  // private function
  _getRoot(leaves = this.leaves) :any {
    if (leaves.length === 1) {
      return leaves[0];
    }

    const layer = [];

    for (let i = 0; i < leaves.length; i += 2) {
      const left = leaves[i];
      const right = leaves[i + 1];

      if (right) {
        layer.push(this.concat(left, right));
      } else {
        layer.push(left);
      }
    }

    return this._getRoot(layer);
  }
}

module.exports = MerkleTree;
