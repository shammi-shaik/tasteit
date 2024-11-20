import { greet } from "./greet";

describe('greet',()=>{
    it('should include name in output', ()=>{
        expect(greet('shammi')).toContain('shammi');
    })
})