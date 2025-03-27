export const delay = (ms: any) => new Promise(res => setTimeout(res, ms));
export   const formatDate = (d: Date) => ((typeof d === 'string' ? d : d.toISOString()).replace('T', ' ').slice(0, 10)) 

