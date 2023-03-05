import { expect } from "chai";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";
import { getFinalHash ,sign,verify} from "../functionalities";
import MerkleTree from "../utils/MerkleTree";

describe("verification",function(){
    it("throw error when the to field is ommited", function(){
        const messageObject = {
            name:"maanas",
            rating:10
        }
        
        expect(()=>getFinalHash(messageObject)).to.throw();
    })

    it("throw error when the invalid hide field is passed", function(){
        const messageObject = {
            to:"0x1234123",
            name:"maanas",
            rating:10
        }
        
        expect(()=>getFinalHash(messageObject,["rank"])).to.throw();
    })    

    it("calculates the hash correctly with 0 hideFields",function(){
        const messageObject:any = {
            to:"0x1234123",
            name:"maanas",
            rating:10
        }

        const keys = Object.keys(messageObject)
        keys.sort()
        const finalObj:any = {}
        for(let i=0;i<keys.length;i++){
            finalObj[keys[i]] = messageObject[keys[i]];
        }

        const expectedHash = toHex(keccak256(utf8ToBytes(JSON.stringify(finalObj))));

        expect(getFinalHash(messageObject)).to.equal(expectedHash)
    })


    it("calculates the hash correctly with 1 hideField",function(){
        const messageObject:any = {
            to:"0x1234123",
            name:"maanas",
            rating:10
        }

        const keys = Object.keys(messageObject)
        keys.sort()
        const finalObj:any = {}
        for(let i=0;i<keys.length;i++){
            if(keys[i] == "name"){
                continue;
            }
            finalObj[keys[i]] = messageObject[keys[i]];
        }

        const hiddenHash = toHex(keccak256(utf8ToBytes(`name:${messageObject["name"]}`)));

        finalObj.hiddenHash = hiddenHash;
        const expectedHash = toHex(keccak256(utf8ToBytes(JSON.stringify(finalObj))));

        expect(getFinalHash(messageObject,["name"])).to.equal(expectedHash)
    })

    it("calculates the hash correctly with multiple hideFields",function(){
        const messageObject:any = {
            to:"0x1234123",
            name:"maanas",
            rating:10,
            age:23
        }

        const keys = Object.keys(messageObject)
        keys.sort()
        const hideFields = ["name","rating"];
        const hides = [];
        const finalObj:any = {}
        for(let i=0;i<keys.length;i++){
            if(hideFields.includes(keys[i])){
                hides.push(`${keys[i]}:${messageObject[keys[i]]}`)
                continue;
            }
            finalObj[keys[i]] = messageObject[keys[i]];
        }
        const merkleTree = new MerkleTree(hides)
        const hiddenHash = merkleTree.getRoot()
        

        finalObj.hiddenHash = hiddenHash;
        const expectedHash = toHex(keccak256(utf8ToBytes(JSON.stringify(finalObj))));

        expect(getFinalHash(messageObject,["name","rating"])).to.equal(expectedHash)
    })
})