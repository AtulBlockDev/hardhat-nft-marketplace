
const { developmentChains } = require("../../helper-hardhat-config");
const { network, ethers, getNamedAccounts } = require("hardhat")
const { expect, assert } = require("chai");

!developmentChains.includes(network.name) ? describe.skip
: describe("NftMarketPlaceTesting", ()=>{

    let deployer, user, NftMarketPlaceForDeployer, NftMarketPlaceForUser, BasicNftContract
    const PRICE = ethers.utils.parseEther("0.1")
    const TOKEN_ID = 0



    beforeEach(async function(){

        const accounts = await ethers.getSigners()
        user = accounts[0];
        deployer = (await getNamedAccounts()).deployer
        
        await deployments.fixture(["all"])
        NftMarketPlaceForDeployer = await ethers.getContract("NftMarketPlace", deployer)
        
       
        BasicNftContract = await ethers.getContract("BasicNft", deployer)
        await BasicNftContract.mintNft()
        await BasicNftContract.approve(NftMarketPlaceForDeployer.address, TOKEN_ID)


        })

          describe("listItem",function () {
              it("emits an event after listing an item", async function () {
                 expect(await
                    NftMarketPlaceForDeployer.listItem(BasicNftContract.address, TOKEN_ID, PRICE)).to.emit("ItemListed")

                })

                
                it("exclusively lists item that have not been listed", async function(){
                    await NftMarketPlaceForDeployer.listItem(BasicNftContract.address, TOKEN_ID, PRICE)

                    await expect( NftMarketPlaceForDeployer.listItem(BasicNftContract.address, TOKEN_ID, PRICE)).
                    to.be.revertedWith("NftMarketPlace_AlreadyListed");
                })
                // it("exclusively allows owner to list", async function(){
                //     NftMarketPlaceForUser = await NftMarketPlaceForDeployer.connect(user)
                //     await BasicNftContract.approve(NftMarketPlaceForUser.address, TOKEN_ID)
                    
                //     await expect(NftMarketPlaceForUser.listItem(BasicNftContract.address, TOKEN_ID, PRICE)).
                //     to.be.revertedWith("NftMarketPlace_NotOwner")

                // })
                it("reverts if the listed Item has price Zero or less", async function(){
                    const price = ethers.utils.parseEther("0")
                     await expect(NftMarketPlaceForDeployer.listItem(BasicNftContract.address, TOKEN_ID, price))
                    .to.be.revertedWith("NftMarketPlace_PriceMustBeAboveZero")
                })
                
                it("reverts if the marketplace is not approved", async function(){
                    await BasicNftContract.approve(ethers.constants.AddressZero, TOKEN_ID)
                expect(
                    NftMarketPlaceForDeployer.listItem(BasicNftContract.address, TOKEN_ID, PRICE)
                ).to.be.revertedWith("NftMarketPlace_NotApprovedForMarketPlace")
                })

                it("updates the listings mapping after item listing", async function(){
                    await NftMarketPlaceForDeployer.listItem(BasicNftContract.address, TOKEN_ID, PRICE)

                    const NftListing = await NftMarketPlaceForDeployer.getListing(BasicNftContract.address, TOKEN_ID)
                    assert.equal((NftListing.price).toString(), PRICE)
                    assert.equal(NftListing.seller, deployer)
                })

                

              })
              describe("buyItem", function (){


                it("emits an event when an item is bought", async function(){
                    await NftMarketPlaceForDeployer.listItem(
                        BasicNftContract.address,
                        TOKEN_ID,
                        PRICE
                    )
                   NftMarketPlaceForUser = await NftMarketPlaceForDeployer.connect(user)
                   await NftMarketPlaceForUser.buyitem(BasicNftContract.address, TOKEN_ID, {value: PRICE})
                })

                it("reverts if the item is not listed", async function(){
                    NftMarketPlaceForUser = await NftMarketPlaceForDeployer.connect(user)
                    await expect(
                        NftMarketPlaceForUser.buyitem(BasicNftContract.address, TOKEN_ID, {
                            value: PRICE,
                        })
                    ).to.be.revertedWith("NftMarketPlace_NotListed")
                })
                it("reverts if pirce is not met to buy Nft", async function(){
                    NftMarketPlaceForUser = await NftMarketPlaceForDeployer.connect(user)
                    await NftMarketPlaceForDeployer.listItem(
                        BasicNftContract.address,
                        TOKEN_ID,
                        PRICE
                    )
                    await expect(NftMarketPlaceForUser.buyitem(BasicNftContract.address, TOKEN_ID, {value: "0"}))
                    .to.be.revertedWith("NftMarketPlace_PriceNotMet")

                })
                it("updates the ownership of Nft and proceeds for seller", async function(){
                    NftMarketPlaceForUser = await NftMarketPlaceForDeployer.connect(user)
                    await NftMarketPlaceForDeployer.listItem(BasicNftContract.address, TOKEN_ID, PRICE)
                    await NftMarketPlaceForUser.buyitem(BasicNftContract.address, TOKEN_ID, {value: PRICE})

                    const sellerProceeds = await NftMarketPlaceForDeployer.getProceeds(deployer);
                    const NftOwner = await BasicNftContract.ownerOf(TOKEN_ID)
                    assert.equal(sellerProceeds.toString(), PRICE)
                    assert.equal(NftOwner.toString(), user.address)
                })

              })
              describe("cancelListing", async function(){

                it("deletes an existing listing and emits an event", async function(){
                    await NftMarketPlaceForDeployer.listItem(BasicNftContract.address, TOKEN_ID, PRICE)
                    expect(await
                        NftMarketPlaceForDeployer.cancelListing(BasicNftContract.address, TOKEN_ID)
                    ).to.emit("nftMarketPlace_ItemRemoved")
                    const listing = await NftMarketPlaceForDeployer.getListing(BasicNftContract.address, TOKEN_ID)
                    assert(listing.price.toString() == "0")
                })

              })
              describe("withdrawProceeds", function(){
                it("withdrawProceeds", async function(){
                     NftMarketPlaceForUser = await NftMarketPlaceForDeployer.connect(user)
                    await NftMarketPlaceForDeployer.listItem(BasicNftContract.address, TOKEN_ID, PRICE)
                    await NftMarketPlaceForUser.buyitem(BasicNftContract.address, TOKEN_ID, {value: PRICE})

                    const SellerProccedsBefore = await NftMarketPlaceForDeployer.getProceeds(deployer)
                    const deployerBalanceBefore = await deployer.getBalance()
                    const tx = await NftMarketPlaceForDeployer.withdrawProceeds()
                    const tx_receipt = await tx.wait(1)
                    const{gasUsed, effectiveGasPrice} = tx_receipt
                    gasCost = gasUsed.mul(effectiveGasPrice)
                    const SellerProccedsAfter = await NftMarketPlaceForDeployer.getProceeds(deployer)
                    const deployerBalanceAfter = await deployer.getBalance()
                    assert.equal(SellerProccedsBefore.toString(), PRICE)
                    assert.equal(SellerProccedsAfter.toString(), "0")
                    assert.equal(deployerBalanceAfter.toString().add(gasCost), deployerBalanceBefore.toString().add(SellerProccedsBefore))


                    
                })
              })


          })
        
        