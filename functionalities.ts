import { keccak256 } from "ethereum-cryptography/keccak";
import * as secp256k1 from "ethereum-cryptography/secp256k1";
import {toHex, utf8ToBytes} from "ethereum-cryptography/utils";

import MerkleTree from "./utils/MerkleTree"

interface proofObject{
    data:string,
    left:boolean
}
/*
    signature format:
    to: address
    field : value
    we must be able to showcase only parts. therefore the final signature will be the merkled hash 
*/

export function generateProof(message:any,hideFields:string[],hideField:string) : proofObject[]{
    if(!message.to){
        throw new Error("A to field is neccessary")
    }

    hideFields.forEach((field)=>{
        if(!message[field]){
            throw Error("invalid hide field");
        }
        if(field == "to"){
            throw Error("The to field cannot be hidden");
        }
    })

    let finalObj:any = {};
    
    const fields = Object.keys(message);
    fields.sort();  
    const hides : string[] = [];

    fields.forEach((field)=>{
        if(hideFields?.includes(field)){
            hides.push(`${field}:${message[field]}`);
        }else{
            finalObj[field] = message[field];
        }       
    })

    if(!hideFields.includes(hideField)){
        throw new Error("Field is not hidden");
    }

    const merkleTree = new MerkleTree(hides);
    const proof = merkleTree.getProofForMessage(`${hideField}:${message[hideField]}`) as proofObject[];
    return proof;
}

export function getFinalHash(message:any,hideFields?:string[]){
    if(!message.to){
        throw new Error("A to field is neccessary")
    }

    hideFields?.forEach((field)=>{
        if(!message[field]){
            throw Error("invalid hide field");
        }
        if(field == "to"){
            throw Error("The to field cannot be hidden");
        }
    })

    let finalObj:any = {};
    
    const fields = Object.keys(message);
    fields.sort();  
    const hides : string[] = [];

    fields.forEach((field)=>{
        if(hideFields?.includes(field)){
            hides.push(`${field}:${message[field]}`);
        }else{
            finalObj[field] = message[field];
        }       
    })

    
    if(hides.length){
        const merkleTree = new MerkleTree(hides);
        const merkleRoot = merkleTree.getRoot();
        finalObj.hiddenHash = merkleRoot;
    }

    console.log(finalObj)
    return toHex(keccak256(utf8ToBytes(JSON.stringify(finalObj))));
}


export function verify(storedHash:string,givenString:string,hiddenElement?:string,hiddenProof?:proofObject[]) : boolean {
    if(!hiddenProof){
        if(toHex(keccak256(utf8ToBytes(givenString))) == storedHash){
            return true;
        }else{
            return false;
        }
    }

    if(!hiddenElement){
        throw Error("Provide hidden element for verification");
    }

    const hiddenHash:string = JSON.parse(storedHash).hiddenHash;
    let tempHash = toHex(keccak256(utf8ToBytes(hiddenElement)));
    for(let i=0;i<hiddenProof.length;i++){
        const currentProofElle = hiddenProof[i];
        tempHash = toHex(keccak256(utf8ToBytes(currentProofElle.left ? currentProofElle.data.concat(tempHash) : tempHash.concat(currentProofElle.data))));
    }

    if(hiddenHash == tempHash){
        return true;
    }else{
        return false;
    }
}



export async function sign(finalHash:string,privateKey:string) : Promise<string> {
    const [signature,recovery] = await secp256k1.sign(finalHash,privateKey,{
        recovered:true
    })
    return toHex(signature);
}
