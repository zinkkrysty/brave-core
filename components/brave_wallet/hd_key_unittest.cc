/* Copyright (c) 2021 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/components/brave_wallet/hd_key.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/string_util.h"
#include "testing/gtest/include/gtest/gtest.h"

namespace brave_wallet {

TEST(HDKeyUnitTest, TestVector1) {
  const struct {
    const char* path;
    const char* ext_pub;
    const char* ext_pri;
  } cases[] = {
      {"m",
       "xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ2"
       "9ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8",
       "xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChk"
       "VvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi"},
      {"m/0'",
       "xpub68Gmy5EdvgibQVfPdqkBBCHxA5htiqg55crXYuXoQRKfDBFA1WEjWgP6LH"
       "hwBZeNK1VTsfTFUHCdrfp1bgwQ9xv5ski8PX9rL2dZXvgGDnw",
       "xprv9uHRZZhk6KAJC1avXpDAp4MDc3sQKNxDiPvvkX8Br5ngLNv1TxvUxt4cV1"
       "rGL5hj6KCesnDYUhd7oWgT11eZG7XnxHrnYeSvkzY7d2bhkJ7"},
      {"m/0'/1",
       "xpub6ASuArnXKPbfEwhqN6e3mwBcDTgzisQN1wXN9BJcM47sSikHjJf3UFHKkN"
       "AWbWMiGj7Wf5uMash7SyYq527Hqck2AxYysAA7xmALppuCkwQ",
       "xprv9wTYmMFdV23N2TdNG573QoEsfRrWKQgWeibmLntzniatZvR9BmLnvSxqu5"
       "3Kw1UmYPxLgboyZQaXwTCg8MSY3H2EU4pWcQDnRnrVA1xe8fs"},
      {"m/0'/1/2'",
       "xpub6D4BDPcP2GT577Vvch3R8wDkScZWzQzMMUm3PWbmWvVJrZwQY4VUNgqFJP"
       "MM3No2dFDFGTsxxpG5uJh7n7epu4trkrX7x7DogT5Uv6fcLW5",
       "xprv9z4pot5VBttmtdRTWfWQmoH1taj2axGVzFqSb8C9xaxKymcFzXBDptWmT7"
       "FwuEzG3ryjH4ktypQSAewRiNMjANTtpgP4mLTj34bhnZX7UiM"},
      {"m/0'/1/2'/2",
       "xpub6FHa3pjLCk84BayeJxFW2SP4XRrFd1JYnxeLeU8EqN3vDfZmbqBqaGJAyi"
       "LjTAwm6ZLRQUMv1ZACTj37sR62cfN7fe5JnJ7dh8zL4fiyLHV",
       "xprvA2JDeKCSNNZky6uBCviVfJSKyQ1mDYahRjijr5idH2WwLsEd4Hsb2Tyh8R"
       "fQMuPh7f7RtyzTtdrbdqqsunu5Mm3wDvUAKRHSC34sJ7in334"},
      {"m/0'/1/2'/2/1000000000",
       "xpub6H1LXWLaKsWFhvm6RVpEL9P4KfRZSW7abD2ttkWP3SSQvnyA8FSVqNTEcY"
       "FgJS2UaFcxupHiYkro49S8yGasTvXEYBVPamhGW6cFJodrTHy",
       "xprvA41z7zogVVwxVSgdKUHDy1SKmdb533PjDz7J6N6mV6uS3ze1ai8FHa8kmH"
       "ScGpWmj4WggLyQjgPie1rFSruoUihUZREPSL39UNdE3BBDu76"},
  };

  std::vector<uint8_t> bytes;
  // path: m
  EXPECT_TRUE(
      base::HexStringToBytes("000102030405060708090a0b0c0d0e0f", &bytes));

  std::unique_ptr<HDKey> m_key = HDKey::GenerateFromSeed(bytes);

  for (size_t i = 0; i < sizeof(cases) / sizeof(cases[0]); ++i) {
    std::unique_ptr<HDKey> key = m_key->DeriveChildFromPath(cases[i].path);
    EXPECT_EQ(key->GetPublicExtendedKey(), cases[i].ext_pub);
    EXPECT_EQ(key->GetPrivateExtendedKey(), cases[i].ext_pri);
  }
}

TEST(HDKeyUnitTest, TestVector2) {
  const struct {
    const char* path;
    const char* ext_pub;
    const char* ext_pri;
  } cases[] = {
      {"m",
       "xpub661MyMwAqRbcFW31YEwpkMuc5THy2PSt5bDMsktWQcFF8syAmRUapSCGu8ED9W6oDMS"
       "gv6Zz8idoc4a6mr8BDzTJY47LJhkJ8UB7WEGuduB",
       "xprv9s21ZrQH143K31xYSDQpPDxsXRTUcvj2iNHm5NUtrGiGG5e2DtALGdso3pGz6ssrdK4"
       "PFmM8NSpSBHNqPqm55Qn3LqFtT2emdEXVYsCzC2U"},
      {"m/0",
       "xpub69H7F5d8KSRgmmdJg2KhpAK8SR3DjMwAdkxj3ZuxV27CprR9LgpeyGmXUbC6wb7ERfv"
       "rnKZjXoUmmDznezpbZb7ap6r1D3tgFxHmwMkQTPH",
       "xprv9vHkqa6EV4sPZHYqZznhT2NPtPCjKuDKGY38FBWLvgaDx45zo9WQRUT3dKYnjwih2yJ"
       "D9mkrocEZXo1ex8G81dwSM1fwqWpWkeS3v86pgKt"},
      {"m/0/2147483647'",
       "xpub6ASAVgeehLbnwdqV6UKMHVzgqAG8Gr6riv3Fxxpj8ksbH9ebxaEyBLZ85ySDhKiLDBr"
       "QSARLq1uNRts8RuJiHjaDMBU4Zn9h8LZNnBC5y4a",
       "xprv9wSp6B7kry3Vj9m1zSnLvN3xH8RdsPP1Mh7fAaR7aRLcQMKTR2vidYEeEg2mUCTAwCd"
       "6vnxVrcjfy2kRgVsFawNzmjuHc2YmYRmagcEPdU9"},
      {"m/0/2147483647'/1",
       "xpub6DF8uhdarytz3FWdA8TvFSvvAh8dP3283MY7p2V4SeE2wyWmG5mg5EwVvmdMVCQcoNJ"
       "xGoWaU9DCWh89LojfZ537wTfunKau47EL2dhHKon",
       "xprv9zFnWC6h2cLgpmSA46vutJzBcfJ8yaJGg8cX1e5StJh45BBciYTRXSd25UEPVuesF9y"
       "og62tGAQtHjXajPPdbRCHuWS6T8XA2ECKADdw4Ef"},
      {"m/0/2147483647'/1/2147483646'",
       "xpub6ERApfZwUNrhLCkDtcHTcxd75RbzS1ed54G1LkBUHQVHQKqhMkhgbmJbZRkrgZw4kox"
       "b5JaHWkY4ALHY2grBGRjaDMzQLcgJvLJuZZvRcEL",
       "xprvA1RpRA33e1JQ7ifknakTFpgNXPmW2YvmhqLQYMmrj4xJXXWYpDPS3xz7iAxn8L39njG"
       "VyuoseXzU6rcxFLJ8HFsTjSyQbLYnMpCqE2VbFWc"},
      {"m/0/2147483647'/1/2147483646'/2",
       "xpub6FnCn6nSzZAw5Tw7cgR9bi15UV96gLZhjDstkXXxvCLsUXBGXPdSnLFbdpq8p9HmGsA"
       "pME5hQTZ3emM2rnY5agb9rXpVGyy3bdW6EEgAtqt",
       "xprvA2nrNbFZABcdryreWet9Ea4LvTJcGsqrMzxHx98MMrotbir7yrKCEXw7nadnHM8Dq38"
       "EGfSh6dqA9QWTyefMLEcBYJUuekgW4BYPJcr9E7j"},
  };
  std::vector<uint8_t> bytes;
  // path: m
  EXPECT_TRUE(base::HexStringToBytes(
      "fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c9996"
      "93908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542",
      &bytes));

  std::unique_ptr<HDKey> m_key = HDKey::GenerateFromSeed(bytes);
  for (size_t i = 0; i < sizeof(cases) / sizeof(cases[0]); ++i) {
    std::unique_ptr<HDKey> key = m_key->DeriveChildFromPath(cases[i].path);
    EXPECT_EQ(key->GetPublicExtendedKey(), cases[i].ext_pub);
    EXPECT_EQ(key->GetPrivateExtendedKey(), cases[i].ext_pri);
  }
}

TEST(HDKeyUnitTest, TestVector3) {
  const struct {
    const char* path;
    const char* ext_pub;
    const char* ext_pri;
  } cases[] = {
      {"m",
       "xpub661MyMwAqRbcEZVB4dScxMAdx6d4nFc9nvyvH3v4gJL378CSRZiYmhRoP7mBy6gSPSC"
       "Yk6SzXPTf3ND1cZAceL7SfJ1Z3GC8vBgp2epUt13",
       "xprv9s21ZrQH143K25QhxbucbDDuQ4naNntJRi4KUfWT7xo4EKsHt2QJDu7KXp1A3u7Bi1j"
       "8ph3EGsZ9Xvz9dGuVrtHHs7pXeTzjuxBrCmmhgC6"},
      {"m/0'",
       "xpub68NZiKmJWnxxS6aaHmn81bvJeTESw724CRDs6HbuccFQN9Ku14VQrADWgqbhhTHBaoh"
       "PX4CjNLf9fq9MYo6oDaPPLPxSb7gwQN3ih19Zm4Y",
       "xprv9uPDJpEQgRQfDcW7BkF7eTya6RPxXeJCqCJGHuCJ4GiRVLzkTXBAJMu2qaMWPrS7AAN"
       "Yqdq6vcBcBUdJCVVFceUvJFjaPdGZ2y9WACViL4L"},
  };
  std::vector<uint8_t> bytes;
  // path: m
  EXPECT_TRUE(base::HexStringToBytes(
      "4b381541583be4423346c643850da4b320e46a87ae3d2a4e6da11eba819cd4acba45d239"
      "319ac14f863b8d5ab5a0d0c64d2e8a1e7d1457df2e5a3c51c73235be",
      &bytes));

  std::unique_ptr<HDKey> m_key = HDKey::GenerateFromSeed(bytes);
  for (size_t i = 0; i < sizeof(cases) / sizeof(cases[0]); ++i) {
    std::unique_ptr<HDKey> key = m_key->DeriveChildFromPath(cases[i].path);
    EXPECT_EQ(key->GetPublicExtendedKey(), cases[i].ext_pub);
    EXPECT_EQ(key->GetPrivateExtendedKey(), cases[i].ext_pri);
  }
}

TEST(HDKeyUnitTest, GenerateFromExtendedKey) {
  // m/0/2147483647'/1/2147483646'/2
  std::unique_ptr<HDKey> hdkey_from_pri = HDKey::GenerateFromExtendedKey(
      "xprvA2nrNbFZABcdryreWet9Ea4LvTJcGsqrMzxHx98MMrotbir7yrKCEXw7nadnHM8Dq38E"
      "GfSh6dqA9QWTyefMLEcBYJUuekgW4BYPJcr9E7j");
  EXPECT_EQ(hdkey_from_pri->depth_, 5u);
  EXPECT_EQ(hdkey_from_pri->parent_fingerprint_, 0x31a507b8u);
  EXPECT_EQ(hdkey_from_pri->index_, 2u);
  EXPECT_EQ(base::ToLowerASCII(base::HexEncode(hdkey_from_pri->chain_code_)),
            "9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271");
  EXPECT_EQ(base::ToLowerASCII(base::HexEncode(hdkey_from_pri->private_key_)),
            "bb7d39bdb83ecf58f2fd82b6d918341cbef428661ef01ab97c28a4842125ac23");
  EXPECT_EQ(
      base::ToLowerASCII(base::HexEncode(hdkey_from_pri->public_key_)),
      "024d902e1a2fc7a8755ab5b694c575fce742c48d9ff192e63df5193e4c7afe1f9c");
  EXPECT_EQ(base::ToLowerASCII(base::HexEncode(hdkey_from_pri->identifier_)),
            "26132fdbe7bf89cbc64cf8dafa3f9f88b8666220");

  // m/0/2147483647'/1/2147483646'/2
  std::unique_ptr<HDKey> hdkey_from_pub = HDKey::GenerateFromExtendedKey(
      "xpub6FnCn6nSzZAw5Tw7cgR9bi15UV96gLZhjDstkXXxvCLsUXBGXPdSnLFbdpq8p9HmGsAp"
      "ME5hQTZ3emM2rnY5agb9rXpVGyy3bdW6EEgAtqt");
  EXPECT_EQ(hdkey_from_pub->depth_, 5u);
  EXPECT_EQ(hdkey_from_pub->parent_fingerprint_, 0x31a507b8u);
  EXPECT_EQ(hdkey_from_pub->index_, 2u);
  EXPECT_EQ(base::ToLowerASCII(base::HexEncode(hdkey_from_pub->chain_code_)),
            "9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271");
  EXPECT_TRUE(hdkey_from_pub->private_key_.empty());
  EXPECT_EQ(
      base::ToLowerASCII(base::HexEncode(hdkey_from_pub->public_key_)),
      "024d902e1a2fc7a8755ab5b694c575fce742c48d9ff192e63df5193e4c7afe1f9c");
  EXPECT_EQ(base::ToLowerASCII(base::HexEncode(hdkey_from_pub->identifier_)),
            "26132fdbe7bf89cbc64cf8dafa3f9f88b8666220");
}

TEST(HDKeyUnitTest, Sign) {
  std::unique_ptr<HDKey> key = HDKey::GenerateFromExtendedKey(
      "xprvA2nrNbFZABcdryreWet9Ea4LvTJcGsqrMzxHx98MMrotbir7yrKCEXw7nadnHM8Dq38E"
      "GfSh6dqA9QWTyefMLEcBYJUuekgW4BYPJcr9E7j");

  std::vector<uint8_t> msg_a(32, 0x00);
  std::vector<uint8_t> sig_a = key->ECDSASign(msg_a);
  EXPECT_EQ(base::ToLowerASCII(base::HexEncode(sig_a)),
            "6ba4e554457ce5c1f1d7dbd10459465e39219eb9084ee23270688cbe0d49b52b79"
            "05d5beb28492be439a3250e9359e0390f844321b65f1a88ce07960dd85da06");
}

}  // namespace brave_wallet
