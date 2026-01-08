"use client"

import { useState, useEffect, useRef } from "react"
import { updateProfile } from "firebase/auth"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage" // <--- NEW IMPORT
import { db, storage } from "@/lib/firebase" // <--- IMPORT STORAGE
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" // <--- IMPORT AVATAR IMAGE
import {
  Settings, LogOut, ShieldCheck, X, Save, Loader2, Briefcase, Camera
} from "lucide-react"

interface UserProfilePopupProps {
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
}

export function UserProfilePopup({ isOpen, onClose, onLogout }: UserProfilePopupProps) {
  const { user, isPremium } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false) // <--- NEW STATE
  const popupRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null) // <--- REF FOR INPUT

  // Form State
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [jobTitle, setJobTitle] = useState("")
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "") // <--- PHOTO STATE

  useEffect(() => {
    if (isOpen && user) {
      const fetchUserData = async () => {
        try {
          const docRef = doc(db, "users", user.uid)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            const data = docSnap.data()
            setJobTitle(data.jobTitle || "")
            if (data.photoURL) setPhotoURL(data.photoURL) // Sync Firestore Photo
          }
        } catch (error) {
          console.error("Error loading profile:", error)
        }
      }
      fetchUserData()
      setDisplayName(user.displayName || "")
      setPhotoURL(user.photoURL || "")
    }
  }, [isOpen, user])

  // --- NEW: HANDLE IMAGE UPLOAD ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    try {
      // 1. Upload to Firebase Storage
      const storageRef = ref(storage, `users/${user.uid}/profile-picture`)
      await uploadBytes(storageRef, file)

      // 2. Get URL
      const url = await getDownloadURL(storageRef)

      // 3. Update Auth & Firestore
      await updateProfile(user, { photoURL: url })
      await updateDoc(doc(db, "users", user.uid), { photoURL: url })

      setPhotoURL(url)
    } catch (error) {
      console.error("Upload failed:", error)
      alert("Failed to upload image. Make sure it is under 5MB.")
    } finally {
      setUploading(false)
    }
  }

  // Handle Save (Text Data)
  const handleSave = async () => {
    if (!user) return
    setLoading(true)
    try {
      await updateProfile(user, { displayName: displayName })
      await updateDoc(doc(db, "users", user.uid), {
        displayName: displayName,
        jobTitle: jobTitle
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setLoading(false)
    }
  }

  // Close on Click Outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen || !user) return null

  const getInitials = () => displayName ? displayName.slice(0, 2).toUpperCase() : "U"

  return (
    <div className="absolute top-16 right-4 md:right-8 z-50">
      <div ref={popupRef} className="w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">

        {/* Header */}
        <div className="h-20 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
          <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-2 right-2 text-white/80 hover:text-white hover:bg-white/20 h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 -mt-10 relative">

          {/* Avatar with Upload Button */}
          <div className="flex justify-between items-end mb-4">
            <div className="relative group">
              <Avatar className="h-20 w-20 border-4 border-white shadow-md bg-white">
                <AvatarImage src={photoURL} className="object-cover" />
                <AvatarFallback className="text-2xl font-bold bg-slate-100 text-slate-700">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              {/* Upload Overlay Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 bg-gray-900 text-white p-1.5 rounded-full shadow-lg hover:bg-blue-600 transition-colors border-2 border-white cursor-pointer"
                title="Change Photo"
              >
                {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
              </button>

              {/* Hidden Input */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleImageUpload}
              />
            </div>

            {isPremium ? (
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" /> PRO
              </div>
            ) : (
              <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold border border-gray-200 mb-2">
                FREE
              </div>
            )}
          </div>

          {/* Edit / View Mode */}
          {isEditing ? (
            <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Full Name</label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-8 text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Job Title</label>
                <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="h-8 text-sm mt-1" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} disabled={loading} size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-8">
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Save className="w-3 h-3 mr-1.5" /> Save</>}
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="outline" size="sm" className="flex-1 h-8">Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="text-left space-y-1 mb-6">
              <h3 className="text-lg font-bold text-gray-900 truncate">{displayName || "User"}</h3>
              <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> {jobTitle || "No Job Title Set"}
              </p>
              <p className="text-xs text-gray-400 truncate pt-1 border-t mt-2">{user.email}</p>
            </div>
          )}

          {!isEditing && (
            <div className="space-y-1 pt-2 border-t border-gray-100 mt-2">
              <button onClick={() => setIsEditing(true)} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md transition-colors text-left">
                <Settings className="w-4 h-4 text-gray-400" /> Edit Profile Details
              </button>
              <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors text-left">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}