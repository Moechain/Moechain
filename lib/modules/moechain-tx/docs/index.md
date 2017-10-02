# Transaction


Creates a new transaction object.

**Parameters**

-   `data` **Buffer or Array or Object** a transaction can be initiailized with either a buffer containing the RLP serialized transaction or an array of buffers relating to each of the tx Properties, listed in order below in the exmple.Or lastly an Object containing the Properties of the transaction like in the Usage example.For Object and Arrays each of the elements can either be a Buffer, a hex-prefixed (0x) String , Number, or an object with a toBuffer method such as Bignum
    -   `data.chainId` **Number** mainnet: 1, other network should use other number, it should large than 0
    -   `data.to` **Buffer** to the to address
    -   `data.value` **Buffer** the amount of ether sent
    -   `data.data` **Buffer** this will contain the data of the message or the init of a contract
    -   `data.v` **Buffer** EC signature parameter
    -   `data.r` **Buffer** EC signature parameter
    -   `data.s` **Buffer** EC recovery ID


**Properties**

-   `raw` **Buffer** The raw rlp encoded transaction

**Examples**

```javascript
var rawTx = {
  to: '0000000000000000000000000000000000000000',
  value: '00',
  data: '7f7465737432000000000000000000000000000000000000000000000000000000600057',
  v: '1c',
  r: '5e1d3a76fbf824220eafc8c79ad578ad2b67d01b0c2425eb1f1347e8f50882ab',
  s: '5bd428537f05f9830e93792f90ea6a3e2d1ee84952dd96edbae9f658f831ab13'
};
var tx = new Transaction(rawTx);
```


## getChainId


returns the public key of the sender

Returns **Buffer** 



## getSenderAddress

returns the sender's address

Returns **Buffer** 

## getSenderPublicKey

returns the public key of the sender

Returns **Buffer** 

## getUpfrontCost

the up front amount that an account must have for this transaction to be valid

Returns **BN** 

## hash

Computes a sha3-256 hash of the serialized tx

**Parameters**

-   `includeSignature` **[Boolean]** whether or not to inculde the signature (optional, default `true`)

Returns **Buffer** 

## sign

sign a transaction with a given a private key

**Parameters**

-   `privateKey` **Buffer** 

## toCreationAddress

If the tx's `to` is to the creation address

Returns **Boolean** 

## validate


validates the signature and checks to see if it has enough gas

**Parameters**

-   `stringError` **[Boolean]** whether to return a string with a dscription of why the validation failed or return a Bloolean (optional, default `false`)

Returns **Boolean or String** 

## verifySignature

Determines if the signature is valid

Returns **Boolean** 

## from

**Properties**

-   `from` **Buffer** (read only) sender address of this transaction, mathematically derived from other parameters.

## serialize

Returns the rlp encoding of the transaction

Returns **Buffer** 
