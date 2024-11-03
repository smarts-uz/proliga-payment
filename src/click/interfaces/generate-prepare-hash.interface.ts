export interface GenerateMd5HashParams {
  clickTransId: string;
  serviceId: number;
  secretKey: string;
  merchantTransId: string;
  merchantPrepareId?: number;
  price: number;
  action: number;
  signTime: string;
}
