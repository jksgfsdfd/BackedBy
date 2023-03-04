import { keccak256 } from "ethereum-cryptography/keccak";
import * as secp256k1 from "ethereum-cryptography/secp256k1";
import {toHex, utf8ToBytes} from "ethereum-cryptography/utils";


/*
    signature format:
    to: address
    field : value
    we must be able to showcase only parts. therefore the final signature will be the merkled hash 
*/

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
    const hashes : string[] = [];

    fields.forEach((field)=>{
        if(hideFields?.includes(field)){
            hashes.push(toHex(keccak256(utf8ToBytes(`${field}:${message[field]}`))));
        }else{
            finalObj[field] = message[field];
        }       
    })

    let length = hashes.length;
    while(length>1){
        let odd = false;
        if(length%2){
            odd = true;
            length--;
        }
        for(let i=0;i<length;i+=2){
            hashes[i/2] = toHex(keccak256(utf8ToBytes(hashes[i].concat(hashes[i+1]))));
        
        }
        if(odd){
            hashes[length/2] = hashes[length+1];
        }
        length/=2;
    }

    const merkleRoot = hashes[0];
    if(merkleRoot){
        finalObj.hiddenHash = merkleRoot;
    }

    return toHex(keccak256(utf8ToBytes(JSON.stringify(finalObj))));
}

interface proofObject{
    value:string,
    left:boolean
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
        tempHash = toHex(keccak256(utf8ToBytes(currentProofElle.left ? currentProofElle.value.concat(tempHash) : tempHash.concat(currentProofElle.value))));
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
