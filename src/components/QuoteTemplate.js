// components/PDFTemplate.js
import React from 'react';

function QuoteTemplate({ data }) {
  const thStyle = {
    backgroundColor: '#673ab7',
    color: 'white',
    padding: '10px',
    textAlign: 'left',
    fontSize: '13px'
  };

  const tdStyle = {
    padding: '10px',
    borderBottom: '1px solid #ddd',
    fontSize: '13px'
  };

  return (
    <div style={{ fontFamily: 'Arial', padding: '40px', color: '#333', maxWidth: '850px', margin: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ color: '#673ab7', margin: 0 }}>Quotation</h2>
          <p><strong>Quotation #:</strong> {data.quotationNo}</p>
          <p><strong>Quotation Date:</strong> {data.quotationDate}</p>
        </div>
        <img src="/React.png" alt="Company Logo" style={{ height: 50 }} />
      </div>

      {/* Company & Client Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30 }}>
        <div>
          <p><strong>Quotation by</strong></p>
          <p>{data.from.companyName}</p>
          <p>{data.from.address}</p>
          <p>PAN: {data.from.pan}</p>
        </div>
        <div>
          <p><strong>Quotation to</strong></p>
          <p>{data.to.companyName}</p>
          <p>{data.to.address}</p>
          <p>PAN: {data.to.pan}</p>
        </div>
      </div>

      {/* Place of Supply */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
        <p><strong>Place of Supply:</strong> {data.placeOfSupply}</p>
        <p><strong>Country of Supply:</strong> {data.countryOfSupply}</p>
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
        <thead>
          <tr>
            <th style={thStyle}>Item # / Item Description</th>
            <th style={thStyle}>Qty.</th>
            <th style={thStyle}>Rate</th>
            <th style={thStyle}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => (
            <tr key={i}>
              <td style={tdStyle}>{i + 1}. {item.description}</td>
              <td style={tdStyle}>{item.qty}</td>
              <td style={tdStyle}>₹ {item.rate.toLocaleString()}</td>
              <td style={tdStyle}>₹ {(item.qty * item.rate).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 30 }}>
        <table style={{ fontSize: '14px' }}>
          <tbody>
            <tr>
              <td style={{ padding: '5px 10px' }}>Sub Total</td>
              <td style={{ padding: '5px 10px' }}>₹ {data.subtotal.toLocaleString()}</td>
            </tr>
            <tr>
              <td style={{ padding: '5px 10px', color: 'green' }}>Discount({data.discountPercent}%)</td>
              <td style={{ padding: '5px 10px', color: 'green' }}>- ₹ {data.discountAmount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style={{ padding: '5px 10px', fontWeight: 'bold' }}>Total</td>
              <td style={{ padding: '5px 10px', fontWeight: 'bold' }}>₹ {data.total.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Amount in Words */}
      <p style={{ marginTop: 20, fontSize: '13px' }}>
        <strong>Invoice Total (in words)</strong><br />
        {data.totalInWords}
      </p>

      {/* Terms and Notes */}
      <div style={{ marginTop: 30 }}>
        <p style={{ color: '#673ab7', fontWeight: 'bold' }}>Terms and Conditions</p>
        <ol style={{ fontSize: '13px' }}>
          {data.terms.map((term, i) => (
            <li key={i}>{term}</li>
          ))}
        </ol>
        <p style={{ color: '#673ab7', fontWeight: 'bold' }}>Additional Notes</p>
        <p style={{ fontSize: '13px' }}>{data.notes}</p>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 50 }}>
        <div style={{ fontSize: '12px' }}>
          <p>For any enquiries, email us on <strong>{data.contactEmail}</strong><br />
            or call us on <strong>{data.contactPhone}</strong></p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <img src={data.signature} alt="Signature" style={{ height: '40px' }} />
          <p style={{ fontSize: '12px', marginTop: 5 }}>Authorized Signature</p>
        </div>
      </div>
    </div>
  );
}

export default QuoteTemplate;
