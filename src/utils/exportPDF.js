import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { formatCurrency } from './formatCurrency'

/**
 * Export element as PDF
 */
export async function exportElementAsPDF(elementId, filename = 'laporan-fintrack.pdf') {
  const element = document.getElementById(elementId)
  if (!element) return

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#0A0A0F',
    useCORS: true,
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
  pdf.save(filename)
}

/**
 * Generate a financial report PDF
 */
export function generateReportPDF(data, period, currency = 'IDR') {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  
  // Header
  pdf.setFillColor(10, 10, 15)
  pdf.rect(0, 0, pageWidth, 50, 'F')
  
  pdf.setTextColor(0, 255, 136)
  pdf.setFontSize(28)
  pdf.setFont('helvetica', 'bold')
  pdf.text('FinTrack', 20, 25)
  
  pdf.setTextColor(200, 200, 220)
  pdf.setFontSize(12)
  pdf.text(`Laporan Keuangan - ${period}`, 20, 38)
  
  // Summary Section
  let y = 65
  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Ringkasan', 20, y)
  
  y += 12
  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'normal')
  
  const summaryItems = [
    { label: 'Total Pemasukan', value: formatCurrency(data.totalIncome || 0, currency), color: [0, 180, 100] },
    { label: 'Total Pengeluaran', value: formatCurrency(data.totalExpense || 0, currency), color: [220, 50, 50] },
    { label: 'Saldo', value: formatCurrency((data.totalIncome || 0) - (data.totalExpense || 0), currency), color: [100, 100, 220] },
    { label: 'Jumlah Transaksi', value: `${data.transactionCount || 0} transaksi`, color: [150, 150, 150] },
  ]
  
  summaryItems.forEach(item => {
    pdf.setTextColor(80, 80, 80)
    pdf.text(item.label, 20, y)
    pdf.setTextColor(...item.color)
    pdf.setFont('helvetica', 'bold')
    pdf.text(item.value, 100, y)
    pdf.setFont('helvetica', 'normal')
    y += 10
  })
  
  // Transactions Table
  y += 10
  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Daftar Transaksi', 20, y)
  
  y += 10
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(100, 100, 100)
  pdf.text('Tanggal', 20, y)
  pdf.text('Kategori', 55, y)
  pdf.text('Catatan', 95, y)
  pdf.text('Jumlah', 155, y)
  
  y += 2
  pdf.setDrawColor(200, 200, 200)
  pdf.line(20, y, 190, y)
  y += 6
  
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(50, 50, 50)
  
  const transactions = data.transactions || []
  transactions.slice(0, 30).forEach(tx => {
    if (y > 270) {
      pdf.addPage()
      y = 20
    }
    
    pdf.text(tx.date || '-', 20, y)
    pdf.text((tx.category || '-').substring(0, 18), 55, y)
    pdf.text((tx.note || '-').substring(0, 25), 95, y)
    
    if (tx.type === 'income') {
      pdf.setTextColor(0, 180, 100)
      pdf.text(`+${formatCurrency(tx.amount, currency)}`, 155, y)
    } else {
      pdf.setTextColor(220, 50, 50)
      pdf.text(`-${formatCurrency(tx.amount, currency)}`, 155, y)
    }
    pdf.setTextColor(50, 50, 50)
    y += 7
  })
  
  // Footer
  const totalPages = pdf.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setFontSize(8)
    pdf.setTextColor(150, 150, 150)
    pdf.text(`Dibuat oleh FinTrack | Halaman ${i} dari ${totalPages}`, pageWidth / 2, 290, { align: 'center' })
  }
  
  pdf.save(`laporan-fintrack-${period}.pdf`)
}

/**
 * Export transactions as CSV
 */
export function exportCSV(transactions, currency = 'IDR') {
  const headers = ['Tanggal', 'Jenis', 'Kategori', 'Catatan', 'Jumlah']
  const rows = transactions.map(tx => [
    tx.date,
    tx.type === 'income' ? 'Pemasukan' : tx.type === 'expense' ? 'Pengeluaran' : 'Transfer',
    tx.category || '-',
    tx.note || '-',
    tx.amount,
  ])
  
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `transaksi-fintrack-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
