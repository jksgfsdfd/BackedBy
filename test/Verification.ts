import { expect } from "chai";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";
import { getFinalHash ,sign,verify} from "../functionalities";

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


    it("calculates the hash correctly with hideFields",function(){
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

        const hiddenHash = toHex(keccak256(utf8ToBytes(messageObject.name)));

        const hashingObject = {
            to:"0x1234123",
            rating:10,
            hiddenHash:hiddenHash
        }
        const expectedHash = toHex(keccak256(utf8ToBytes(JSON.stringify(hashingObject))));

        expect(getFinalHash(messageObject,["name"])).to.not.equal(expectedHash)
    })
})