export function iou(a,b) {
  const area=c=>Math.max(0,c[2]-c[0])*Math.max(0,c[3]-c[1]);
  const common=[Math.max(a[0],b[0]),Math.max(a[1],b[1]),Math.min(a[2],b[2]),Math.min(a[3],b[3])];
  const intersection=area(common);return intersection/Math.max(1e-9,area(a)+area(b)-intersection);
}

// Greedy, one-to-one class-consistent association. Detector is trained; this
// association step is intentionally a small, explicitly documented baseline.
export class IoUTracker {
  constructor(threshold=.2,maxAge=2){this.threshold=threshold;this.maxAge=maxAge;this.tracks=[];this.next=1;}
  update(detections){
    for(const t of this.tracks)t.age++;
    const pairs=[];
    for(let i=0;i<this.tracks.length;i++)for(let j=0;j<detections.length;j++){
      const t=this.tracks[i],d=detections[j];if(t.label===d.label){const score=iou(t.box,d.box);if(score>=this.threshold)pairs.push({i,j,score});}
    }
    pairs.sort((a,b)=>b.score-a.score);const usedT=new Set(),usedD=new Set(),output=[];
    for(const {i,j} of pairs){if(usedT.has(i)||usedD.has(j))continue;usedT.add(i);usedD.add(j);const t=this.tracks[i];t.box=detections[j].box;t.age=0;output.push({...detections[j],track_id:t.id});}
    for(let j=0;j<detections.length;j++)if(!usedD.has(j)){const t={id:this.next++,age:0,...detections[j]};this.tracks.push(t);output.push({...detections[j],track_id:t.id});}
    this.tracks=this.tracks.filter(t=>t.age<=this.maxAge);
    return output;
  }
}
