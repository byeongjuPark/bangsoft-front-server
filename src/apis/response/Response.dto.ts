import { ResponseCode } from "../../types";

export default interface ResponseDto {
    code: ResponseCode;
    message: string;
}