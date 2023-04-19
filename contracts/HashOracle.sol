// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./CallerContract.sol";

contract HashOracle {
    uint private randNonce = 0;
    uint private modulus = 1000;

    mapping (uint256 => bool) pendingRequests;
    event GetHashRequestEvent(address callerAddress, string hashMes, uint id);
    event SetHashResEvent(string hashRes,address callerAddress);

    // 该函数供caller调用，实现发起哈希请求
    function getHashRequest(string memory _message) public returns(uint256){
        randNonce++;
        uint256 id = uint(keccak256(abi.encodePacked(block.timestamp,msg.sender,randNonce))) % modulus;
        pendingRequests[id] = true;
        emit GetHashRequestEvent(msg.sender, _message, id);

        return id;
    }

    // 调用该函数将哈希结果写入callerContract合约中,调用回调函数
    function setHashRes(string memory _hashRes, address _callerAddress, uint256 _id) public {
        require(pendingRequests[_id],"This request is not in my pending list.");
        delete pendingRequests[_id];
        // 使用callerAddress调用回调函数
        CallerContract(_callerAddress).callback(_hashRes, _id);
        emit SetHashResEvent(_hashRes, _callerAddress);
    }
}

