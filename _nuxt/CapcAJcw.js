import{u as t}from"./DmRkKMBD.js";import{z as e}from"./DtohoFz0.js";async function n(){const a=t(),{data:{session:s}}=await a.auth.getSession();s?.user&&await e("/dashboard")}export{n as u};
