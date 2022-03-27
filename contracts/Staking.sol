//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
//import "@uniswap/v2-core/contracts/interfaces/IUniswapV2ERC20.sol";

contract Staking {
    address private _owner;

    struct Wallet {
        uint256 rewardPerToken;
        uint256 stakeTime;
        uint256 rewards;
        uint256 balance;
    }

    mapping(address => Wallet) public wallets;

    IERC20 public rewardsToken;
    IERC20 public stakingToken;

    uint256 public lockTime = 10 minutes;

    uint256 public rewardRate = 100;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;

    uint256 private _totalSupply;
    uint256 private _decimals;
    uint256 private _withdrawalFee = 0; // format: 1 = 0.01%
    uint256 private _claimPeriod = 2 minutes;

    constructor(address _stakingToken, address _rewardsToken) {
        _owner = msg.sender;
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardsToken);
        _decimals = 18;
        lastUpdateTime = block.timestamp;
    }

    modifier onlyOwner() {
        require(msg.sender == _owner, "Restricted operation");
        _;
    }

    //  - Функция stake(uint256 amount) - списывает с пользователя на контракт стейкинга ЛП
    //          токены в количестве amount, обновляет в контракте баланс пользователя
    //  - Функция claim() - списывает с контракта стейкинга ревард токены доступные в качестве наград
    //  - Функция unstake() - списывает с контракта стейкинга ЛП токены доступные для вывода

    function stake(uint256 _amount) external {
        updateReward(msg.sender);
        if (wallets[msg.sender].balance == 0) {
            wallets[msg.sender].stakeTime = block.timestamp;
        }
        _totalSupply += _amount;
        wallets[msg.sender].balance += _amount;
        stakingToken.transferFrom(msg.sender, address(this), _amount);
    }

    function unstake(uint256 _amount) external {
        require(
            block.timestamp >= wallets[msg.sender].stakeTime + _claimPeriod,
            "Locktime not passed"
        );
        updateReward(msg.sender);
        _totalSupply -= _amount;
        wallets[msg.sender].balance -= _amount;
        stakingToken.transfer(msg.sender, _amount);
    }

    function claim() external {
        require(
            block.timestamp >= wallets[msg.sender].stakeTime + lockTime,
            "Locktime not passed"
        );
        updateReward(msg.sender);
        uint256 reward = withFee(wallets[msg.sender].rewards);
        wallets[msg.sender].rewards = 0;
        rewardsToken.transfer(msg.sender, reward);
    }

    //  служебные

    function rewardPerToken() private view returns (uint256) {
        if (_totalSupply == 0) {
            return 0;
        }
        return rewardPerTokenStored + (((block.timestamp - lastUpdateTime)
        * rewardRate * (10 ** _decimals)) / _totalSupply);
    }

    function claimable(address account) public view returns (uint256) {
        return withFee(
            (wallets[account].balance) *
            (rewardPerToken() - wallets[account].rewardPerToken) +
            wallets[account].rewards
        );
    }

    function updateReward(address account) internal {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;

        wallets[account].rewards = withoutFee(claimable(account));
        wallets[account].rewardPerToken = rewardPerTokenStored;
    }

    function withFee(uint256 _amount) private view returns (uint256) {
        return _amount * (100 - _withdrawalFee / 100) / 100;
    }

    function withoutFee(uint256 _amount) private view returns (uint256) {
        return _amount / (100 - _withdrawalFee / 100) * 100;
    }

    //  - Функции админа для изменения параметров стейкинга (время заморозки, процент)

    function setFee(uint256 _fee) external onlyOwner {
        require(_fee <= 10000, "Invalid value");
        _withdrawalFee = _fee;
    }

    function setLockTime(uint256 _time) external onlyOwner {
        lockTime = _time;
    }

    function setClaimPeriod(uint256 _time) external onlyOwner {
        _claimPeriod = _time;
    }
}
