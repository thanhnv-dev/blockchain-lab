import { Address, beginCell, Cell, toNano } from "@ton/core";
import BigNumber from "bignumber.js";

const getTonFromNanograms = (amount: string | number) => {
  let currentAmount;
  if (amount as string) {
    currentAmount = parseFloat(amount as string);
  } else {
    currentAmount = amount;
  }
  let result = (currentAmount as number) / 1000000000;
  let resultString = result.toString();
  if (resultString.startsWith("-")) {
    resultString = resultString.slice(1);
  }
  return parseFloat(resultString);
};

const getNanogramsFromTon = (amount: string | number) => {
  let currentAmount;
  if (amount as string) {
    currentAmount = parseFloat(amount as string);
  } else {
    currentAmount = amount;
  }
  return (currentAmount as number) * 1000000000;
};

export const parseRawAddress = (rawAddress: string) => {
  try {
    return Address.parseRaw(rawAddress).toString({
      bounceable: false,
    });
  } catch (error) {
    console.log("parseRawAddress error", error);
    return rawAddress;
  }
};

function encodeStringToCell(str: string): Cell {
  const encoded = Buffer.from(str, "utf-8");

  return beginCell().storeBuffer(encoded).endCell();
}

const validAddress = (address: string) => {
  try {
    Address.parse(address);
    return true;
  } catch (error) {
    console.error("validAddress error", error);
    return false;
  }
};
const compareExactOwnerAddress = (
  address1: string,
  address2: string
): boolean => {
  if (address1.length !== address2.length) {
    return false;
  }

  for (let i = 0; i < address1.length; i++) {
    if (address1[i] !== address2[i]) {
      return false;
    }
  }
  return true;
};

const getRawAddress = (address: string) => {
  try {
    return Address.parse(address).toRawString();
  } catch (error) {
    console.error("getRawAddress error", error);
    return address;
  }
};

const getFeeStatus = (fee: string | number | undefined): boolean => {
  const parsed = Number(fee);
  if (parsed > 0) return true;
  return false;
};

/**
 * Convert string to decimal number with specified number of decimals
 * @param value - String value to convert
 * @param decimals - Number of decimal places (default is 18)
 * @returns string - Result as string to ensure precision
 */
const formatBigNumber = (value: string, decimals: number = 9): number => {
  try {
    const bigNumber = new BigNumber(value);
    const result = bigNumber
      .div(new BigNumber(10).pow(decimals))
      .abs()
      .toNumber();
    return result;
  } catch (error) {
    console.error("Error formatting big number:", error);
    return 0;
  }
};

const convertWithDecimal = (value: string, decimals: number = 9): string => {
  try {
    const bigNumber = new BigNumber(value);
    const result = bigNumber
      .div(new BigNumber(10).pow(decimals))
      .abs()
      .toString();
    return result;
  } catch (error) {
    console.error("Error formatting big number:", error);
    return "0";
  }
};

/**
 * Convert decimal number to big number string with specified number of decimals
 * @param value - Number value to convert
 * @param decimals - Number of decimal places (default is 9)
 * @returns string - Result as string with specified decimals
 */
const toBigNumber = (value: number | string, decimals: number = 9): string => {
  try {
    const bigNumber = new BigNumber(value);
    const result = bigNumber.times(new BigNumber(10).pow(decimals)).toFixed(0);
    return result;
  } catch (error) {
    console.error("Error converting to big number:", error);
    return "0";
  }
};

const getMinFeeForJettonTransaction = (
  numberOfTransactions: number,
  minFeeFromRemoteConfig?: number
) => {
  // Minimum fee for a jetton transaction 0.05 TON

  const minFeeForJettonTransfer = toNano(minFeeFromRemoteConfig ?? 0.05);

  return minFeeForJettonTransfer * BigInt(numberOfTransactions);
};

const TonUtils = {
  getTonFromNanograms,
  getNanogramsFromTon,
  parseRawAddress,
  getRawAddress,
  validAddress,
  formatBigNumber,
  toBigNumber,
  getMinFeeForJettonTransaction,
  compareExactOwnerAddress,
  encodeStringToCell,
  convertWithDecimal,
  getFeeStatus,
};

export default TonUtils;
