import { findBYPlanetID } from "../game/game.service"
import { findBYCollectionID } from "./nft.services"

export const createfromgame = async (req, res, next) => {

const { planetId , transcation , collectionId , userId , walletAddress , nftId,ipfs,metaData , from} = req.body 
if(from !=  "game"){
next()
}
const planetdata = await findBYPlanetID(planetId)
const collectiondata = await findBYCollectionID(collectionId)
req.body.CollectionNetwork = collectiondata?.CollectionNetwork
req.body.CollectionName = collectiondata?.CollectionSymbol
req.body.NFTId = nftId
req.body.NFTName = planetdata?.name
req.body.Category = collectiondata?.Category
req.body.NFTDescription = planetdata?.planetDescription
req.body.NFTOrginalImage = planetdata?.image_url
req.body.NFTThumpImage = ""
req.body.UnlockContent = "no"
req.body.CollectionSymbol = collectiondata?.CollectionSymbol
req.body.ContractAddress = collectiondata?.CollectionContractAddress
req.body.ContractType = collectiondata?.CollectionType
req.body.NFTRoyalty = "10"
req.body.NFTProperties = []
req.body.CompressedFile = planetdata?.image_url
req.body.CompressedThumbFile = planetdata?.image_url
req.body.NFTOrginalImageIpfs = ipfs
req.body.NFTThumpImageIpfs = ""
req.body.MetaData = metaData
req.body.MetFile = planetdata?.name + ".txt"
req.body.NFTCreator = walletAddress
// 
req.body.NFTOwner = walletAddress
req.body.NFTQuantity = "1" 
req.body.PutOnSale = false
req.body.PutOnSaleType = "UnlimitedAuction"
req.body.NFTPrice = ""
req.body.CoinName = collectiondata?.CollectionNetwork
req.body.ClockTime = "",
req.body.EndClockTime = "",
req.body.HashValue ="",
req.body.activity = 'mint',
req.body.NFTBalance = "1",

// LazyStatus,
// NonceHash,
// RandomName,
// SignatureHash


next()
}