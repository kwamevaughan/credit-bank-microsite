import { useState } from 'react';

export default function TransactionsFeesTable() {
  return (
    <div className="bg-gray-900 text-white py-12 px-4 md:px-16">
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold">Account & Transaction Fees</h2>
        <p className="mt-2 text-lg md:text-xl">
          Discover transparent and customer-friendly account features and charges, ensuring you have full visibility and control over your banking experience.
        </p>
      </div>

      <div className="flex justify-center items-center">
        <div 
          className="w-full max-w-4xl overflow-x-auto" 
          style={{
            boxShadow: '5px 12px 0 rgba(251, 146, 60, 0.6)',
            marginBottom: '20px'
          }}
        >
          <table className="w-full border-collapse min-w-full">
            <tbody>
              <tr className="bg-orange-600">
                <td
                  rowSpan="5"
                  className="text-white font-bold text-lg px-4 py-6 md:px-6 md:py-12 text-center align-middle w-1/3 md:w-1/4"
                >
                  Nyumbani Diaspora Account Rates per Annum
                </td>
                <th className="text-left px-3 py-2 md:px-4 text-white">
                  Features
                </th>
                <th className="text-left px-3 py-2 md:px-4 text-white">
                  Rate
                </th>
              </tr>
              <tr className="bg-orange-500 hover:bg-orange-400 transition-colors duration-200">
                <td className="px-3 py-2 md:px-4 text-white">Opening balance</td>
                <td className="px-3 py-2 md:px-4 text-white">
                  Kshs. 5,000 | USD 50 | GBP 50 | Euro 50
                </td>
              </tr>
              <tr className="bg-orange-500 hover:bg-orange-400 transition-colors duration-200">
                <td className="px-3 py-2 md:px-4 text-white">Ledger fees</td>
                <td className="px-3 py-2 md:px-4 text-white">Nil</td>
              </tr>
              <tr className="bg-orange-500 hover:bg-orange-400 transition-colors duration-200">
                <td className="px-3 py-2 md:px-4 text-white">Minimum operating balance</td>
                <td className="px-3 py-2 md:px-4 text-white">Nil</td>
              </tr>
              <tr className="bg-orange-500 hover:bg-orange-400 transition-colors duration-200">
                <td className="px-3 py-2 md:px-4 text-white">Interest rate</td>
                <td className="px-3 py-2 md:px-4 text-white">
                  Earns interest on balances above KES 2 million
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center">
        <a href="https://creditbank.co.ke/wp-content/uploads/2025/02/Tariff-Guide-Updated-Feb-2025-1.pdf" className="text-white hover:text-orange-500 text-md italic">Full Tarriff Guide</a>
      </div>
    </div>
  );
}