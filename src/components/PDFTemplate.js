// components/PDFTemplate.js
import React from 'react';
import logoImg from './React256.png';
function PDFTemplate({ data }) {
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  };

  const thStyle = {
    backgroundColor: '#004d99',
    color: 'white',
    padding: '8px',
    textAlign: 'left',
    fontSize: '14px',
  };

  const tdStyle = {
    border: '1px solid #ddd',
    padding: '8px',
    fontSize: '14px',
  };

  //const companyLogoString = ""

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial', color: '#333', maxWidth: '800px', margin: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>WednesdAI 3D Labs.</h2>
          <p>1234 Sample St,<br />Company Town, ST 12345</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          {/* Static Logo */}
          <img
            src={logoImg} // Replace this with actual logo path or base64 string
            alt="Company Logo"
            style={{ height: '150px',padding:'20px', objectFit: 'contain' }}
          />
        </div>
      </div>

      <h1 style={{ color: '#004d99', marginTop: '40px' }}>QUOTATION</h1>

      {/* Quote Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <div>
          <p><strong>Bill To</strong></p>
          <p>{data.customerName}<br />{data.customerAddress}</p>
        </div>
        <div>
          <p><strong>Quote #:</strong> {data.quoteNo}</p>
          <p><strong>Quote date:</strong> {data.quoteDate}</p>
          <p><strong>Due date:</strong> {data.dueDate}</p>
        </div>
      </div>
      <br/>
      <div>PRODUCT NAME : {data.productName}</div>
      {/* Table */}
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>S.NO</th>
            <th style={thStyle}>Description</th>
            <th style={thStyle}>Unit Price</th>
            <th style={thStyle}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, idx) => (
            <tr key={idx}>
              <td style={tdStyle}>{item.sNo}</td>
              <td style={tdStyle}>{item.description}</td>
              <td style={tdStyle}>{item.unitPrice.toFixed(2)}</td>
              <td style={tdStyle}>{(data.productQty * item.unitPrice).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ textAlign: 'right', marginTop: '20px', fontSize: '14px' }}>
        <p><strong>Subtotal:</strong> {data.subtotal.toFixed(2)}</p>
        <p><strong>Sales Tax (18%):</strong> {data.tax.toFixed(2)}</p>
        <p style={{ fontSize: '16px', color: '#004d99' }}><strong>Total (USD):</strong> {data.total.toFixed(2)}</p>
      </div>

      {/* Terms */}
      <div style={{ marginTop: '30px', fontSize: '13px' }}>
        <p><strong>Terms and Conditions</strong></p>
        <p>Payment is due in 14 days</p>
        <p>Please make checks payable to: Your Company Inc.</p>
      </div>
      <br/>
      {/* Signature */}
      <div style={{ align:'right' ,marginTop: '50px', borderTop: '1px solid #ccc', width: '200px' }}>
        <p style={{ fontSize: '12px', marginTop: '8px' }}>customer signature</p>
      </div>
    </div>
  );
}

export default PDFTemplate;
