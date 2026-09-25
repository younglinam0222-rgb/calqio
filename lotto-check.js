(function(root){
function check(numbers,draw){
 if(numbers.length!==6||new Set(numbers).size!==6||numbers.some(n=>!Number.isInteger(n)||n<1||n>45))throw Error('1~45의 서로 다른 정수 6개를 입력해 주세요.');
 const matches=numbers.filter(n=>draw.nums.includes(n));const bonus=numbers.includes(draw.bonus);
 const rank=matches.length===6?1:matches.length===5?(bonus?2:3):matches.length===4?4:matches.length===3?5:null;
 return {matches,bonus,rank};
}
const api={check};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LottoCheck=api;
})(globalThis);
