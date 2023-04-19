// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./HashOracle.sol";

contract CallerContract {
    // 记录返回的哈希值
    string private hashRes;

    // HashOracleInterface private oracleInstance;

    address private oracleAddress;

    // 维护一个请求list，类似cookie
    mapping (uint256 => bool) myRequests;

    // event newOracleAddressEvent(address oracleAddress);
    // 记录oracle传回的数据
    event getHashEvent(string hashRes, uint256 id);
    event ReceivedNewHashRequestEvent(string hashMessage, uint256 id);
    // // 更新oracle地址，并生成实例
    // function setOracleInstanceAddress(address _oracleInstanceAddress) public onlyOwner {
    //     oracleAddress = _oracleInstanceAddress;
    //     oracleInstance = HashOracle(oracleAddress);
    //     emit newOracleAddressEvent(oracleAddress);
    // }

    // 生成哈希请求
    function hashRequest(string memory _hashMessage, address _oracleAddress) public {
        oracleAddress = _oracleAddress;
        uint256 id = HashOracle(_oracleAddress).getHashRequest(_hashMessage);
        myRequests[id] = true;
        emit ReceivedNewHashRequestEvent(_hashMessage, id);
    }

    // 回调函数，由oracle调用返回结果
    function callback(string memory _hashRes,uint256 _id) public onlyOracle{
        require(myRequests[_id],"This request is not in my pending list.");
        hashRes = _hashRes;
        // 维护待处理列表
        delete myRequests[_id];
        emit getHashEvent(_hashRes, _id);
    }

    // 定义modifier
    modifier onlyOracle {
        require(msg.sender == oracleAddress,"You are not authorized to call this function."); // 检查调用者是否为owner地址
        _; // 如果是的话，继续运行函数主体；否则报错并revert交易
    }

}