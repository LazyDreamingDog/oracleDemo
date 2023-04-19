#### oracleDemo

------

代码目录：

.
├── build
│   └── contracts
│       ├── CallerContract.json
│       └── HashOracle.json
├── Client.js								 // 发出请求的web3客户端
├── contracts								// solidity合约代码
│   ├── CallerContract.sol
│   └── HashOracle.sol
├── HashOracle.js					// 响应请求的oracle服务端（与crypto交互）
├── migrations							// truffle 合约部署代码
│   ├── 1_CallerContrace.js
│   └── 2_HashOracle.js
├── package.json
├── package-lock.json
├── README.md
├── test
├── truffle-config.js					// truffle的配置文件
└── utils
    └── common.js

------

**测试环境：**

​	ubuntu20.04 + vscode + truffle + Ganache

环境配置记录：

```shell
npm install -g truffle

mkdir <>
cd <>
npm init -y
npm install ganache-cli web3 bn.js axios
npm install openzeppelin-solidity@latest (非必需)

```

**测试流程：**

1. 用Ganache启动一条私有链，并在vscode的truffle插件中接入网络
2. deploy contracts
3. 分别启动两个js文件

```shell
node Client.js
开启一个新的终端
node HashOracle.js
```

