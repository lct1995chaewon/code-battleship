importScripts('./pyodide.js');
let ready;
async function init(){const py=await loadPyodide({indexURL:new URL('./',self.location.href).href});const response=await fetch('./runner.py');if(!response.ok)throw Error('Python runner unavailable');await py.runPythonAsync(await response.text());return py;}
ready=init();ready.then(()=>postMessage({type:'ready'})).catch(e=>postMessage({type:'init-error',message:String(e)}));
onmessage=async ({data})=>{if(data.type!=='run')return;try{const py=await ready;py.globals.set('lesson_source',data.code);py.globals.set('lesson_rules',JSON.stringify(data.rules));const result=await py.runPythonAsync('json.dumps(run_lesson(lesson_source, json.loads(lesson_rules)), ensure_ascii=False)');postMessage({type:'result',id:data.id,result:JSON.parse(result)});}catch(e){postMessage({type:'result',id:data.id,result:{ok:false,output:'',error:'RuntimeError',message:String(e)}});}};

