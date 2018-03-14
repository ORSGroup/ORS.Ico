# ORS Community

In order to promote the ICO and future ORS business. we establish a set of
communities. These may be organized by nation, such as one community for Russia,
one for Korea and another for Italy. Communities could also be organized in
other ways, such as a Facebook community, a LinkedIn community and so on.

Each community may have its own bonus %age.

## Requirements

* Each community will have its own smart contract, own SCA
* Each community acts a bit like its own preICO
* Each community has own start/end date:
ITaly : Mar 21st - Mar 30th
* Community members may send ETH between start/end dates only
* Community Manager ("CM") must advise members to use same wallet address they registered with eidoo
* eidoo will provide ORS a list of addresses that have passed AMLKYC after community's end date (after 31Mar)
* A ORS script will compare the eidoo-provided list against the sender addresses by reading events from the blockchain
* ORS will manually refund any address that sent ETH but failed to complete the checks
* For those addresses that did complete the checks and sent ETH:
* Option A: An ORS script will call the ICO Contract to buy tokens and transfer them to the buyer, or
* Option B (simpler): ORS can mine all the necessary tokens directly from the token contract, going around the ICO contract and transfer to the buyers
* The script will award the community bonus
* ORS will manually award each Community Manager 5% of the total purchases done through their community

