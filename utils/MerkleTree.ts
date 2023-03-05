import { keccak256 } from "ethereum-cryptography/keccak";
import {  toHex, utf8ToBytes } from "ethereum-cryptography/utils";

interface proofObject{
  data:string,
  left:boolean
}

class MerkleTree {
  leaves:string[];

  constructor(leaves?:string[]) {
    if(leaves){
      this.leaves = leaves.map((message)=>{
        return toHex(keccak256(utf8ToBytes(message)))
      })
    }else{
      this.leaves = []
    }
  }

  addElement(message:string){
    this.leaves.push(toHex(keccak256(utf8ToBytes(message))))
  }

  getRoot() {
    return this.#getRoot(this.leaves);
  }

  concat(left:string,right:string){
    return toHex(keccak256(utf8ToBytes(left.concat(right))))
  }

  getProof(index:number, layer = this.leaves, proof:proofObject[] = []) : proofObject[] {
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
          let isLeft = Boolean(index % 2);
          proof.push({
            data: isLeft ? left :right ,
            left: isLeft,
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

  getProofForMessage(message:string) : boolean | proofObject[] {
    const hash = toHex(keccak256(utf8ToBytes(message)));
    const index = this.leaves.indexOf(hash);
    if( index == -1){
      return false;
    }else{
      return this.getProof(index);
    }
  }

  // private function
  #getRoot(leaves :string[]) :string {
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

    return this.#getRoot(layer);
  }
}

export default MerkleTree;
