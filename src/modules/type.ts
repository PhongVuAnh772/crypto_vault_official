export type AddressAndKeyResType = {
    key: string;
    address: string;
};
export type SuccessCallbackKeyAndAddress = ({
    key,
    address,
}: AddressAndKeyResType) => void;
