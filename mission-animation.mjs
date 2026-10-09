export const missionScenes={
 signal:{title:'先鋒號，出發！',departure:'收到出航訊息，護航艦出動',salvos:1,swerve:1},
 repair:{title:'通訊恢復，艦隊集結',departure:'通訊接通，左右護航艦會合',salvos:1,swerve:-1},
 flags:{title:'三次平安訊號',departure:'平安訊號確認，三艦同步出航',salvos:3,swerve:0},
 supplies:{title:'補給完成，全速前進',departure:'補給計算正確，艦隊加速',salvos:2,swerve:0},
 cargo:{title:'物資就位，動力啟動',departure:'物資分配完成，主炮就緒',salvos:3,swerve:1},
 route:{title:'航線確認，轉向出擊',departure:'新航線確認，艦隊轉向',salvos:2,swerve:2},
 report:{title:'航程報告收到',departure:'艦長收到報告，前進至目標海域',salvos:2,swerve:-1},
 types:{title:'數據辨識，鎖定目標',departure:'三種數據辨識完成，雷達啟動',salvos:3,swerve:0},
 difference:{title:'數據校正，協同出擊',departure:'數字與文字已分清，艦隊分路包抄',salvos:2,swerve:-2},
 final:{title:'艦隊任務圓滿完成',departure:'最終報告確認，三艦聯合出擊',salvos:3,swerve:1}
};
export const DURATION=6.2;
export const clamp=v=>Math.min(1,Math.max(0,v));
export const smooth=v=>{const t=clamp(v);return t*t*(3-2*t);};
export function sampleMission(id,elapsed){
 const config=missionScenes[id];if(!config)throw Error('Unknown mission animation');
 const t=Math.max(0,elapsed);
 const stages=[config.departure,'炮台轉向，鎖定前方敵艦','主炮齊射！','命中目標，敵艦下沉','海域已安全，艦隊編隊前進'];
 const stage=t<1.6?0:t<2.35?1:t<3.2?2:t<4.7?3:4;
 return {config,stage,caption:stages[stage],progress:clamp(t/DURATION),travel:smooth(t/DURATION),sink:smooth((t-3.2)/1.5),done:t>=DURATION};
}
