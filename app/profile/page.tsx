"use client"

import { useEffect, useState } from "react"
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs"
import {
  Bell,
  CreditCard,
  Key,
  LogOut,
  Mail,
  Settings,
  Shield,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Header } from "@/components/header-nav"

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    portfolioUpdates: true,
    marketNews: false,
    weeklyReport: true,
  })

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Profile & Settings</h1>
        </div>

        <SignedOut>
          <Card className="max-w-md mx-auto mt-8">
            <CardHeader className="text-center">
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>
                Please sign in to view and manage your profile settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <SignInButton mode="modal">
                <Button>Sign In</Button>
              </SignInButton>
            </CardContent>
          </Card>
        </SignedOut>

        <SignedIn>
          <div className="grid gap-6 md:grid-cols-[250px_1fr]">
            {/* Profile Sidebar */}
            <Card className="h-fit">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                    <AvatarFallback>
                      {user?.firstName?.charAt(0)}
                      {user?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h2 className="text-xl font-semibold">{user?.fullName || "User"}</h2>
                    <p className="text-sm text-muted-foreground">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                  <Separator />
                  <div className="w-full space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings Tabs */}
            <Tabs defaultValue="account" className="space-y-4">
              <TabsList>
                <TabsTrigger value="account" className="gap-2">
                  <User className="h-4 w-4" />
                  Account
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="preferences" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Preferences
                </TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                      Manage your account details and personal information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          defaultValue={user?.firstName || ""}
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          defaultValue={user?.lastName || ""}
                          disabled
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue={user?.primaryEmailAddress?.emailAddress || ""}
                        disabled
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      To update your account information, please use the Clerk user button in the header.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Investment Profile</CardTitle>
                    <CardDescription>
                      Set your investment preferences and risk tolerance.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                      <select
                        id="riskTolerance"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        defaultValue="moderate"
                      >
                        <option value="conservative">Conservative</option>
                        <option value="moderate">Moderate</option>
                        <option value="aggressive">Aggressive</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="investmentGoal">Investment Goal</Label>
                      <select
                        id="investmentGoal"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        defaultValue="growth"
                      >
                        <option value="income">Income Generation</option>
                        <option value="growth">Long-term Growth</option>
                        <option value="preservation">Capital Preservation</option>
                        <option value="speculation">Speculation</option>
                      </select>
                    </div>
                    <Button>Save Preferences</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Choose what notifications you want to receive.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Price Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when stocks hit your target prices.
                        </p>
                      </div>
                      <Switch
                        checked={notifications.priceAlerts}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, priceAlerts: checked })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Portfolio Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Daily summary of your portfolio performance.
                        </p>
                      </div>
                      <Switch
                        checked={notifications.portfolioUpdates}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, portfolioUpdates: checked })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Market News</Label>
                        <p className="text-sm text-muted-foreground">
                          Breaking news and market updates.
                        </p>
                      </div>
                      <Switch
                        checked={notifications.marketNews}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, marketNews: checked })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Weekly Report</Label>
                        <p className="text-sm text-muted-foreground">
                          Weekly summary of market trends and your portfolio.
                        </p>
                      </div>
                      <Switch
                        checked={notifications.weeklyReport}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, weeklyReport: checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your account security and authentication.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Key className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Password</p>
                          <p className="text-sm text-muted-foreground">
                            Managed through Clerk authentication
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Shield className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Enable
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Mail className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Email Verification</p>
                          <p className="text-sm text-green-600">Verified</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" disabled>
                        Verified
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Display Preferences</CardTitle>
                    <CardDescription>
                      Customize how the application looks and behaves.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Default Currency</Label>
                      <select
                        id="currency"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        defaultValue="usd"
                      >
                        <option value="usd">USD ($)</option>
                        <option value="eur">EUR (€)</option>
                        <option value="gbp">GBP (£)</option>
                        <option value="inr">INR (₹)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <select
                        id="timezone"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        defaultValue="est"
                      >
                        <option value="est">Eastern Time (ET)</option>
                        <option value="pst">Pacific Time (PT)</option>
                        <option value="utc">UTC</option>
                        <option value="ist">India Standard Time (IST)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chartStyle">Default Chart Style</Label>
                      <select
                        id="chartStyle"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        defaultValue="candlestick"
                      >
                        <option value="candlestick">Candlestick</option>
                        <option value="line">Line</option>
                        <option value="area">Area</option>
                        <option value="bar">Bar</option>
                      </select>
                    </div>
                    <Button>Save Preferences</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    <CardDescription>
                      Irreversible actions for your account.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                      <div>
                        <p className="font-medium">Delete Account</p>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all data.
                        </p>
                      </div>
                      <Button variant="destructive" size="sm">
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </SignedIn>
      </main>
    </div>
  )
}
