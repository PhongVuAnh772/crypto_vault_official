import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getIsTestnet } from 'src/core/redux/slice/app.selector';
import NftService from 'src/core/services/NftService';
import TonNftRepository from 'src/core/repositories/TonNftRepository';
import { NftItem, NftUtility } from 'src/types/nft';

export const useNftMarketplace = (userAddress?: string) => {
  const [nfts, setNfts] = useState<NftItem[]>([]);
  const [utility, setUtility] = useState<NftUtility | null>(null);
  const [loading, setLoading] = useState(false);

  const isTestnet = useSelector(getIsTestnet);
  const network = isTestnet ? 'testnet' : 'mainnet';

  useEffect(() => {
    loadMarketplace();
    if (userAddress) {
      loadUtility();
    }
  }, [userAddress, network]);

  const loadMarketplace = async () => {
    setLoading(true);
    try {
      const data = await NftService.getAllNfts(network);
      setNfts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUtility = async () => {
    if (!userAddress) return;
    try {
      const data = await NftService.getUtility(userAddress, network);
      setUtility(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuy = async (nft: NftItem) => {
    try {
      const txData = await TonNftRepository.buyNft(nft.id, nft.price);
      // await tonConnectUI.sendTransaction({
      //   validUntil: Math.floor(Date.now() / 1000) + 60,
      //   messages: [
      //     {
      //       address: txData.address,
      //       amount: txData.amount,
      //       payload: txData.payload,
      //     },
      //   ],
      // });
      alert('Purchase transaction sent!');
    } catch (err) {
      console.error(err);
      alert('Purchase failed');
    }
  };

  const handleBid = async (nft: NftItem, amount: number) => {
    try {
      const txData = await TonNftRepository.bidNft(nft.id, amount);
      // await tonConnectUI.sendTransaction({
      //   validUntil: Math.floor(Date.now() / 1000) + 60,
      //   messages: [
      //     {
      //       address: txData.address,
      //       amount: txData.amount,
      //       payload: txData.payload,
      //     },
      //   ],
      // });
      alert('Bid transaction sent!');
    } catch (err) {
      console.error(err);
      alert('Bid failed');
    }
  };

  return { nfts, utility, loading, handleBuy, handleBid };
};
