"use client";
import React from "react";
import { LogoScrape } from "logo-scrape";
import Image from "next/image";

function Page() {
  interface Company {
    name: string;
    logo: string;
  }

  //   const [companies, setCompanies] = React.useState<Company[]>([]);

  //   React.useEffect(() => {
  //     async function fetchLogos() {
  //       const google = await LogoScrape.getLogo("https://google.com");
  //       const facebook = await LogoScrape.getLogo("https://facebook.com");
  //       const twitter = await LogoScrape.getLogo("https://twitter.com");
  //       const nvidia = await LogoScrape.getLogo("https://nvidia.com");
  //       const apple = await LogoScrape.getLogo("https://apple.com");
  //       const amazon = await LogoScrape.getLogo("https://amazon.com");
  //       const tesla = await LogoScrape.getLogo("https://tesla.com");
  //       const spacex = await LogoScrape.getLogo("https://spacex.com");

  //       setCompanies([
  //         { name: "Google", logo: google },
  //         { name: "Facebook", logo: facebook },
  //         { name: "Twitter", logo: twitter },
  //         { name: "Nvidia", logo: nvidia },
  //         { name: "Apple", logo: apple },
  //         { name: "Amazon", logo: amazon },
  //         { name: "Tesla", logo: tesla },
  //         { name: "SpaceX", logo: spacex }
  //       ]);
  //     }

  //     fetchLogos();
  //   }, []);

  return (
    <>
      <div className="flex flex-col items-center">
        <div>
          <h1 className="">Some random companies we are not affiliated with</h1>
          <div className="flex flex-wrap gap-4">
            {/* {companies.map((company) => (
              <div key={company.name} className="flex flex-col items-center">
                <h2>{company.name}</h2>
                <Image
                  src={company.logo}
                  alt={company.name}
                  width={20}
                  height={20}
                />
              </div>
            ))} */}
          </div>
        </div>
      </div>
    </>
  );
}

export default Page;
