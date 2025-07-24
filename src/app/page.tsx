'use client'

import { useState, useEffect } from 'react'
import JSZip from 'jszip'

interface Document {
  id: string
  title: string
  description: string
  category: string
  completed: boolean
  file?: File
}

const INITIAL_DOCUMENTS: Document[] = [
  // KİŞİSEL EVRAKLAR
  { id: 'photo', title: '2 adet biyometrik fotoğraf (3.5x4.5)', description: 'Schengen için - Siz Hazırlayacaksınız', category: 'Kişisel Evraklar', completed: false },
  { id: 'passport-copy', title: 'Güncel pasaportun kimlik sayfası fotokopisi', description: 'Siz Hazırlayacaksınız', category: 'Kişisel Evraklar', completed: false },
  { id: 'id-copy', title: 'Kimlik ve Kimlik Fotokopisi', description: 'Siz Hazırlayacaksınız', category: 'Kişisel Evraklar', completed: false },
  { id: 'passport-all', title: 'Güncel pasaportun tüm sayfaları + eski pasaport vizeli sayfalar', description: 'Siz Hazırlayacaksınız', category: 'Kişisel Evraklar', completed: false },
  { id: 'property', title: 'Ev/Araç/Arsa ruhsat/tapu fotokopisi (varsa)', description: 'A4 kağıdına çekilecek - Siz Hazırlayacaksınız', category: 'Kişisel Evraklar', completed: false },

  // FORMLAR
  { id: 'application-form', title: 'Başvuru Formu', description: 'Biz Hazırlayacağız', category: 'Formlar', completed: false },
  { id: 'travel-letter', title: 'Seyahat Niyet Dilekçesi', description: 'Biz Hazırlayacağız', category: 'Formlar', completed: false },

  // E-DEVLET EVRAKLARI
  { id: 'residence', title: 'Yerleşim yeri belgesi', description: 'E-devletten karekodlu - son 7 gün - Siz Hazırlayacaksınız', category: 'E-Devlet Evrakları', completed: false },
  { id: 'population', title: 'Tam tekmil Vukuatlı Nüfus Kayıt Örneği', description: 'E-devletten karekodlu - son 7 gün - Siz Hazırlayacaksınız', category: 'E-Devlet Evrakları', completed: false },
  { id: 'sgk-service', title: 'SGK Hizmet Dökümü (Tüm zamanlar)', description: 'E-devletten karekodlu - son 7 gün - Siz Hazırlayacaksınız', category: 'E-Devlet Evrakları', completed: false },
  { id: 'sgk-entry', title: 'SGK İşe Giriş Bildirgesi', description: 'E-devletten karekodlu - son 7 gün - Siz Hazırlayacaksınız', category: 'E-Devlet Evrakları', completed: false },

  // BANKA EVRAKLARI
  { id: 'bank-statement', title: 'Son 6 aylık Hesap Dökümü (tüm hesaplar)', description: 'Bankadan imzalı kaşeli - son 7 gün - Siz Hazırlayacaksınız', category: 'Banka Evrakları', completed: false },

  // MESLEK VE GİDİŞ AMACI
  { id: 'program-registration', title: 'Program Kayıt Belgesi', description: 'İtalya\'daki eğitim programı kayıt belgesi - başlangıç/bitiş tarihleri net', category: 'Meslek ve Gidiş Amacı', completed: false },

  // İŞYERİ EVRAKLARI
  { id: 'tax-plate', title: 'Güncel Vergi Levhası', description: 'Muhasebeciden istenecek', category: 'İşyeri Evrakları', completed: false },
  { id: 'signature-circular', title: 'İmza Sirküleri veya Beyanname', description: 'Muhasebeciden istenecek', category: 'İşyeri Evrakları', completed: false },
  { id: 'chamber-registration', title: 'Oda Kayıt Belgesi veya Faaliyet Belgesi', description: 'Muhasebeciden istenecek', category: 'İşyeri Evrakları', completed: false },
  { id: 'trade-registry', title: 'Ticaret Sicil Gazetesi', description: 'Muhasebeciden istenecek', category: 'İşyeri Evrakları', completed: false },
  { id: 'taxpayer-cert', title: 'Mükellef Belgesi (şahıs firması ve oda kaydı yoksa)', description: 'Muhasebeciden istenecek', category: 'İşyeri Evrakları', completed: false },
  { id: 'salary-slip', title: '3 aylık banka maaş bordrosu', description: 'İmzalı kaşeli', category: 'İşyeri Evrakları', completed: false },
  { id: 'work-permit', title: 'İş yeri izin yazısı', description: 'İmzalı kaşeli', category: 'İşyeri Evrakları', completed: false },

  // ÖZEL DURUMLAR
  { id: 'retirement-cert', title: 'Emeklilik Belgesi (emekliler için)', description: 'E-devletten barkodlu', category: 'Özel Durumlar', completed: false },
  { id: 'student-cert', title: 'Öğrencilik Belgesi (öğrenciler için)', description: 'E-devletten barkodlu veya okuldan ıslak imza kaşeli', category: 'Özel Durumlar', completed: false },
  { id: 'duty-cert', title: 'Görev Yeri Belgesi (kurum personeli)', description: 'Islak imza kaşeli/barkodlu/elektronik imzalı', category: 'Özel Durumlar', completed: false },
  { id: 'work-cert', title: 'Çalışma Belgesi (kurum personeli)', description: 'Islak imza kaşeli/barkodlu/elektronik imzalı', category: 'Özel Durumlar', completed: false },
  { id: 'leave-letter', title: 'İzin Yazısı (kurum personeli)', description: 'Islak imza kaşeli/barkodlu/elektronik imzalı', category: 'Özel Durumlar', completed: false }
]

export default function VisaTracker() {
  const [documents, setDocuments] = useState<Document[]>(INITIAL_DOCUMENTS)
  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: File}>({})
  const [userId] = useState('default')

  useEffect(() => {
    fetch(`/api/progress?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.documents) {
          const updatedDocuments = INITIAL_DOCUMENTS.map(doc => ({
            ...doc,
            completed: data.documents[doc.id]?.completed || false
          }))
          setDocuments(updatedDocuments)
          
          // Recreate uploaded files state for UI display
          const reconstructedFiles: {[key: string]: File} = {}
          Object.keys(data.documents).forEach(docId => {
            const docData = data.documents[docId]
            if (docData.completed && docData.fileName) {
              // Create a dummy file object for UI display
              const dummyFile = new File([''], docData.fileName, { 
                type: docData.fileType || 'application/octet-stream' 
              })
              reconstructedFiles[docId] = dummyFile
            }
          })
          setUploadedFiles(reconstructedFiles)
        }
      })
      .catch(err => console.error('Error loading progress:', err))
  }, [userId])

  const toggleComplete = async (id: string) => {
    const updatedDocuments = documents.map(doc => 
      doc.id === id ? { ...doc, completed: !doc.completed } : doc
    )
    setDocuments(updatedDocuments)
    
    const document = updatedDocuments.find(doc => doc.id === id)
    if (document) {
      try {
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            docId: id,
            documentData: { completed: document.completed }
          })
        })
      } catch (err) {
        console.error('Error saving progress:', err)
      }
    }
  }

  const handleFileUpload = async (docId: string, file: File) => {
    try {
      const document = documents.find(doc => doc.id === docId)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('docId', docId)
      formData.append('docTitle', document?.title || docId)
      formData.append('userId', userId)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        // Create a dummy file with the clean filename for UI display
        const displayFile = new File([''], result.fileName, { type: file.type })
        setUploadedFiles(prev => ({ ...prev, [docId]: displayFile }))
        
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            docId,
            documentData: {
              completed: true,
              uploadedAt: new Date().toISOString(),
              fileName: result.fileName,
              fileSize: result.size,
              fileType: result.type
            }
          })
        })
        
        toggleComplete(docId)
      } else {
        console.error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
    }
  }

  const handleFileDelete = async (docId: string) => {
    try {
      const response = await fetch('/api/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId, userId })
      })
      
      if (response.ok) {
        setUploadedFiles(prev => {
          const newFiles = { ...prev }
          delete newFiles[docId]
          return newFiles
        })
        
        setDocuments(prev => prev.map(doc => 
          doc.id === docId ? { ...doc, completed: false } : doc
        ))
      } else {
        console.error('Delete failed')
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const downloadFile = async (docId: string) => {
    try {
      const response = await fetch(`/api/progress?userId=${userId}`)
      const progressData = await response.json()
      const fileName = progressData.documents[docId]?.fileName
      
      if (fileName) {
        const downloadResponse = await fetch(`/api/download/${userId}/${fileName}`)
        if (downloadResponse.ok) {
          const blob = await downloadResponse.blob()
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = fileName
          a.click()
          URL.revokeObjectURL(url)
        }
      }
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  const downloadAllAsZip = async () => {
    const zip = new JSZip()
    
    Object.entries(uploadedFiles).forEach(([docId, file]) => {
      const doc = documents.find(d => d.id === docId)
      const folderName = doc?.category.replace(/[^a-zA-Z0-9]/g, '_') || 'Diger'
      zip.folder(folderName)?.file(file.name, file)
    })
    
    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = 'italya-vize-evraklari.zip'
    a.click()
    URL.revokeObjectURL(url)
  }

  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = []
    acc[doc.category].push(doc)
    return acc
  }, {} as {[key: string]: Document[]})

  const completedCount = documents.filter(doc => doc.completed).length
  const totalCount = documents.length
  const progressPercentage = Math.round((completedCount / totalCount) * 100)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">İtalya Vizesi Evrak Takibi</h1>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-2">
                İlerleme: {completedCount}/{totalCount} ({progressPercentage}%)
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            
            {Object.keys(uploadedFiles).length > 0 && (
              <button
                onClick={downloadAllAsZip}
                className="ml-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tüm Dosyaları ZIP İndir ({Object.keys(uploadedFiles).length})
              </button>
            )}
          </div>
        </div>

        {Object.entries(groupedDocuments).map(([category, docs]) => (
          <div key={category} className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
              {category}
            </h2>
            
            <div className="space-y-4">
              {docs.map(doc => (
                <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={doc.completed}
                      onChange={() => toggleComplete(doc.id)}
                      className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    
                    <div className="flex-1">
                      <h3 className={`font-medium ${doc.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {doc.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                      
                      <div className="mt-3 flex items-center gap-3">
                        <input
                          type="file"
                          id={`file-${doc.id}`}
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || [])
                            files.forEach(file => handleFileUpload(doc.id, file))
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor={`file-${doc.id}`}
                          className="cursor-pointer bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
                        >
                          Dosya Yükle
                        </label>
                        
                        {uploadedFiles[doc.id] && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-green-600">
                              ✓ {doc.title} - Yüklendi
                            </span>
                            <button
                              onClick={() => downloadFile(doc.id)}
                              className="text-blue-600 text-sm hover:underline"
                            >
                              İndir
                            </button>
                            <button
                              onClick={() => handleFileDelete(doc.id)}
                              className="text-red-600 text-sm hover:underline"
                            >
                              Sil
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
