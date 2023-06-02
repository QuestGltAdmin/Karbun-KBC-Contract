const { expect } = require("chai");
const { ethers, upgrades, network } = require("hardhat");
const { Contract, Signer, BigNumber } = require('ethers')
require('dotenv').config()

const toKBCDenomination = (Karbun) =>
  ethers.utils.parseUnits(Karbun, DECIMALS)

const DECIMALS = 18
const INITIAL_SUPPLY = ethers.utils.parseUnits('321',6 + DECIMALS)

let accounts = Signer[15],
  deployer = Signer,
  Karbun = Contract,
  initialSupply = BigNumber

async function setupContracts() {
  accounts = await ethers.getSigners()
  deployer = accounts[0]
  const karbun = await ethers.getContractFactory("Karbun");
  const KarbunToken = await karbun.deploy();
  Karbun = await KarbunToken.deployed();
  initialSupply = await KarbunToken.totalSupply()
}

describe('Karbun', () => {
  before('setup Karbun contract', setupContracts)

  it('should reject any ether sent to it', async function () {
    const user = accounts[1]
    await expect(user.sendTransaction({ to: Karbun.address, value: 1 })).to
      .be.reverted
  })
})

describe('Karbun:Initialization', () => {
  before('setup Karbun contract', setupContracts)

  it('should transfer 10B Karbun to the deployer', async function () {
    expect(await Karbun.balanceOf(await deployer.getAddress())).to.eq(
      INITIAL_SUPPLY,
    )
  })

  it('should set the totalSupply to 321M', async function () {
    expect(await Karbun.totalSupply()).to.eq(INITIAL_SUPPLY)
  })

  it('should set the owner', async function () {
    expect(await Karbun.owner()).to.eq(await deployer.getAddress())
  })

  it('should set detailed ERC20 parameters', async function () {
    expect(await Karbun.name()).to.eq('Karbun')
    expect(await Karbun.symbol()).to.eq('KBC')
    expect(await Karbun.decimals()).to.eq(DECIMALS)
  })
})

describe('Karbun:Transfer', function () {
  let UserA = Signer, UserB = Signer, UserC = Signer, provider = Signer

  before('setup Karbun contract', async () => {
    await setupContracts()
    provider = accounts[9]
    UserA = accounts[10]
    UserB = accounts[11]
    UserC = accounts[12]
  })

  describe('deployer transfers sell', function () {
    it('should have correct balances', async function () {
      const deployerBefore = await Karbun.balanceOf(
        await deployer.getAddress(),
      )
      await Karbun
        .connect(deployer)
        .transfer(await provider.getAddress(), toKBCDenomination('10'))
      expect(await Karbun.balanceOf(await deployer.getAddress())).to.eq(
        deployerBefore.sub(toKBCDenomination('10')),
      )
      expect(await Karbun.balanceOf(await provider.getAddress())).to.eq(
        toKBCDenomination('10'),
      )
    })
  })

  describe('deployer transfers 100 to userA', async function () {
    it('should have correct balances', async function () {
      const deployerBefore = await Karbun.balanceOf(
        await deployer.getAddress(),
      )
      await Karbun
        .connect(deployer)
        .transfer(await UserA.getAddress(), toKBCDenomination('100'))
      expect(await Karbun.balanceOf(await deployer.getAddress())).to.eq(
        deployerBefore.sub(toKBCDenomination('100')),
      )
      expect(await Karbun.balanceOf(await UserA.getAddress())).to.eq(
        toKBCDenomination('100'),
      )
    })
  })

  describe('deployer transfers 200 to userB', async function () {
    it('should have correct balances', async function () {
      const deployerBefore = await Karbun.balanceOf(
        await deployer.getAddress(),
      )

      await Karbun
        .connect(deployer)
        .transfer(await UserB.getAddress(), toKBCDenomination('200'))
      expect(await Karbun.balanceOf(await deployer.getAddress())).to.eq(
        deployerBefore.sub(toKBCDenomination('200')),
      )
      expect(await Karbun.balanceOf(await UserB.getAddress())).to.eq(
        toKBCDenomination('200'),
      )
    })
  })

  describe('deployer transfers 100 Buy fees', function () {
    it('should have correct balances', async function () {
      const deployerBefore = await Karbun.balanceOf(
        await deployer.getAddress(),
      )
      const providerBefore = await Karbun.balanceOf(
        await provider.getAddress(),
      )
      await Karbun
        .connect(provider)
        .transfer(await deployer.getAddress(), toKBCDenomination('1'))
      expect(await Karbun.balanceOf(await provider.getAddress())).to.eq(
        providerBefore.sub(toKBCDenomination('1')),
      )
      expect(await Karbun.balanceOf(await deployer.getAddress())).to.eq(
        deployerBefore.add(toKBCDenomination('1')),
      )
    })
  })
})