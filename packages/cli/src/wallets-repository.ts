import { Identities, Transactions } from "@cauriland/crypto";

import { WalletSignType } from "./enums";
import { Wallet, WalletChange } from "./types";

export class WalletRepository {
	private wallets: Wallet[] = [];

	public constructor(wallets: Wallet[]) {
		for (const wallet of wallets) {
			if (wallet.passphrase && wallet.secondPassphrase) {
				wallet.signType = WalletSignType.SecondSignature;
			} else if (wallet.passphrases) {
				wallet.signType = WalletSignType.MultiSignature;
			} else if (wallet.passphrase) {
				wallet.signType = WalletSignType.Basic;
			} else {
				throw new Error(`Error loading wallet: ${wallet}`);
			}

			if (!wallet.publicKey) {
				wallet.publicKey = Identities.PublicKey.fromPassphrase(wallet.passphrase!);
			}

			this.wallets.push(wallet);
		}
	}

	public getWallets(): Wallet[] {
		return this.wallets;
	}

	public addWallet(wallet: Wallet) {
		this.wallets.push(wallet);
	}

	public getWalletInfo(passphrase: string): Wallet {
		return {
			address: Identities.Address.fromPassphrase(passphrase),
			passphrase,
			publicKey: Identities.PublicKey.fromPassphrase(passphrase),
			signType: WalletSignType.Basic,
		};
	}

	public getRandomWallet(): Wallet {
		const randomWallet = this.wallets[Math.floor(Math.random() * this.wallets.length)];
		if (!randomWallet) {
			throw new Error("Error getting random wallet");
		}

		return randomWallet;
	}

	public handleWalletChanges(walletChanges: WalletChange[], response) {
		if (response.data.accept) {
			for (const walletChange of walletChanges) {
				const id = Transactions.Utils.getId(walletChange.transaction.build().data);

				if (response.data.accept.includes(id)) {
					if (walletChange.secondPassphrase) {
						const wallet = this.getWalletInfo(walletChange.passphrase!);

						wallet.signType = WalletSignType.SecondSignature;
						wallet.secondPassphrase = walletChange.secondPassphrase;
					} else {
						const wallet: Wallet = {
							signType: WalletSignType.MultiSignature,
							passphrases: walletChange.passphrases,
							address: walletChange.address,
							publicKey: walletChange.publicKey,
						};

						this.addWallet(wallet);
					}
				}
			}
		}
	}
}
