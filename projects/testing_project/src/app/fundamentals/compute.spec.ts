import { compute } from "./compute"

describe('compute' , () =>{
    it('should return 0 if input is neagative', ()=>{
        const result = compute(-1);
        expect(result).toBe(0);
    })
    it('should increament value if input is positive', ()=>{
        const result = compute(1);
        expect(result).toBe(2);
    })
})