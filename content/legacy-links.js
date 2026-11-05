// Retain every original theme as a cross-chapter method index; book chapters
// remain the canonical hierarchy. Mapping is association, not completion proof.
const mapping={
 math:['m01','m02','m03','m03','m04','m04','m15','m15','m15','m05','m05','m06','m06','m07','m08','m11','m12','m13','m13','m13','m14','m14','m14','m16','m16','m17','m17','m17','m09','m18','m03','m15'],
 physics:['p01','p02','p04','p04','p08','p08','p14','p14','p05','p06','p07','p06','p09','p10','p10','p12','p18','p18','p19','p20','p15','p16','p17','p17','p24','p25','p26','p27','p02','p11','p22','p14'],
 chemistry:['c02','c01','c01','c02','c02','c03','c05','c05','c13','c14','c14','c15','c09','c10','c10','c10','c11','c11','c11','c11','c12','c12','c12','c12','c16','c17','c18','c18','c19','c16','c08','c18'],
 biology:['b02','b03','b04','b04','b05','b05','b05','b05','b06','b08','b07','b08','b09','b10','b11','b12','b13','b14','b14','b15','b16','b16','b17','b17','b18','b19','b20','b21','b22','b23','b24','b24'],
 geography:['g25','g12','g12','g12','g02','g14','g14','g14','g03','g15','g15','g20','g13','g13','g05','g16','g07','g08','g09','g09','g17','g18','g19','g20','g22','g22','g23','g22','g06','g06','g25','g20']
};
export const legacyChapterMap=Object.fromEntries(Object.entries(mapping).flatMap(([s,ids])=>ids.map((chapter,i)=>[`${s}-${String(i+1).padStart(2,'0')}`,chapter])));
